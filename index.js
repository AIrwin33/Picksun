const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const setupSocketIO = require('./socket');
const {pool, pgListen} = require("./server/db");
const authorization = require("./server/utils/authorize");
const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });

const { v4: uuidv4 } = require('uuid');
const path = require('path');
app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.use(express.json());
app.use(session);
// serve static files
app.use(express.static('public'));
// create a route
app.use("/auth",require('./server/routes/jwtAuth'));



app.post("/myprofile", authorization, async (req, res) => {
    try {
        console.log('in profile');
        console.log(req.user.id);
        const participant = await pool.query("SELECT * FROM salesforce.participant__c WHERE ExternalId__c = $1", [req.user.id]);
        res.json(participant.rows[0]);
    } catch (err) {
        console.log('err profile::' + err);
    }
});

app.get("/participants", async (req, res) => {
    try {
        const allParticipants = await pool.query("SELECT * FROM salesforce.participant__c");
        res.json(allParticipants.rows)
    } catch (err) {
        console.log('eerrr' + err.message);
    }
});

app.put("/participant/:id", async (req, res) => {
    try {

        const {id} = req.params;
        const {favorite_team, favorite_sport, favorite_player} = req.body;
        const updatePart = await pool.query(
            "UPDATE salesforce.participant__c SET favorite_team__c = $1, favorite_sport__c = $2, favorite_player__c = $3 WHERE ExternalId__c = $4",
            [favorite_team, favorite_sport, favorite_player, id]
        );
    } catch (err) {
        console.log('err part id' + err.message);
    }
});

app.post("/participations", async (req, res) => {
    try {
        //request user expires, find another way
        console.log(req.user);
        const {contest_id} = req.body;
        console.log(req.user.id);
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id, req.user.id]);
        console.log(part.rows.length);
        
        if (part.rows.length != 0) {
            res.json(part.rows[0]);
            return res.status(401).send("Already Exists");
        }
        console.log('here');
        const newParticipation = await pool.query(
            "INSERT INTO salesforce.participation__c (Contest__c, Participant__r__ExternalId__c,Status__c, externalid__c) VALUES($1,$2,$3, gen_random_uuid()) RETURNING *",
            [contest_id, req.user.id, 'Active']
        );
       
        res.json(newParticipation.rows[0]);
    } catch (err) {
        console.log('error participations' + err.message);
    }
});

app.post("/participationswronganswer", async (req, res) => {
    try {
        const {partid} = req.body;
        console.log('partid::' + partid);
        const participationWrongAnswer = await pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [partid]);
        
        console.log('row' + participationWrongAnswer.rows[0]);
        res.json(participationWrongAnswer.rows[0]);
    } catch (err) {
        console.log('participations wrong answer error ' + err);
    }
});

app.get("/mycontests", authorization, async (req, res) => {
    try {
        //get all participations based on external ID
        const mycontests = await pool.query("SELECT * FROM salesforce.participation__c AS participation, salesforce.contest__c AS contest WHERE participation.participant__r__externalid__c = $1 AND contest.sfid = participation.contest__c",
            [req.user.id]);
        res.json(mycontests.rows);

    } catch (err) {
        console.log('error my contests' + err.message);
    }
});

app.get("/allcontests", authorization, async (req, res) => {
    try {
        console.log('calling all contests');
        //gets all contests in the future
        const allContests = await pool.query("SELECT * FROM salesforce.contest__c WHERE status__c != 'Finished' AND start_time__c > now()");
        res.json(allContests.rows);

    } catch (err) {
        console.log('error all contests' + err.message);
    }
});

app.get("/contestdetail/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const contest = await pool.query("SELECT * FROM salesforce.contest__c WHERE sfid = $1", [id]);
        res.json(contest.rows[0]);
    } catch (err) {
        console.log('error get contest: ' + req.params);
    }
});
app.get("/contestparticipations/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        const part = await pool.query("SELECT * FROM salesforce.participant__c AS participant, salesforce.participation__c AS participation WHERE participation.contest__c = $1 AND participation.participant__r__externalid__c = participant.externalid__c::text;", [contest_id]);
        res.json(part.rows);
    } catch (err) {
        console.log('err all participations by contest::' + err);
    }
});


app.get("/participationbycontest/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;

        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id, req.user.id]);
        
        res.json(part.rows[0]);
    } catch (err) {
        console.log('err participation by contest' + err);
    }
});
app.post("/countsubsegment/", authorization, async (req, res) => {
    try {
        const {conid, subseg} = req.body;
        
        const subsegQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true AND SubSegment__c = $2", [conid, subseg]
        );
        
        res.json(subsegQuestions.rows.length);

    } catch (error) {
        console.log('error disable questions :: ' + error.message);
    }
});
app.post("/contestwon", authorization, async (req, res) => {
    try {
        const contestwoncount = await pool.query(
            "SELECT * FROM salesforce.participant__c WHERE sfid = $1",
            [req.user.id]
        );

        var contestwonnewcount = contestwoncount.Contests_Won__c + 1;
        const wonparticipant = await pool.query(
            "UPDATE salesforce.participant__c SET Contests_Won__c = $1 WHERE sfid = $2 RETURNING *",
            [contestwonnewcount, req.user.id]
        );
        res.json(wonparticipant.rows);

    } catch (err) {
        console.log('contest won error ' + err);
    }

});

app.post("/submitpartanswers", authorization, async (req, res) => {
    try {
        const {partanswers} = req.body;
        var parts = [];
        var participationrec = partanswers[0].participation__c;
        console.log('record' + participationrec);
        
        for(var i=0; i < partanswers.length; i++){
            var answer = partanswers[i];
         
            const partans = await pool.query(
                "UPDATE salesforce.Participation_Answers__c SET selection__c = $1, selection_value__c = $2, Status__c = $3, ExternalId__c = gen_random_uuid() WHERE Participation__c = $4 AND Question__c = $5 RETURNING *", [answer.selection__c, answer.selection_value__c, 'Submitted', answer.participation__c, answer.question__c]
                );
            
            parts.push(partans.rows[0]);

            
        }

        const part = await pool.query(
            "UPDATE salesforce.Participation__c SET Questions_Submitted__c = true WHERE sfid = $1", [participationrec]
            );
        
       
        res.json(parts);
    } catch (err) {
        console.log('error on submit answer' + err);
    }

});

if (process.env.NODE_ENV==="production") {
    // app.use(express.static('client/public'));
    app.use(express.static(path.join(__dirname, '/client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
        // res.sendFile(path.join(__dirname, 'client','index.html')) // relative path
    });
} else {
    app.get('/', (req, res) => {
        res.send('server is listening');
    });
}
// set up Socket.IO
setupSocketIO(http);

// start the server
const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log('listening on *:' + port);
});
