const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
});

const bcrypt = require("bcrypt");
const jwtGenerator = require("./server/utils/jwtGenerator");

const sharedsession = require("express-socket.io-session");
const {pool, pgListen} = require("./server/db");
const bodyParser = require('body-parser');
require("dotenv").config();
//middleware
const cors = require("cors");

app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.use(express.json());

// Attach session
app.use(session);
 
// Share session with io sockets
io.use(sharedsession(session));
const authorization = require("./server/middleware/authorize");
const PORT = process.env.PORT || 5000;
const path = require("path");



process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

//PG Promise setup
const promise = require('bluebird'); // or any other Promise/A+ compatible library;

const initOptions = {
    promiseLib: promise, // overriding the default (ES6 Promise);
    schema: ['public', 'salesforce']
};


const pgp = require('pg-promise')(initOptions);
pgp.pg.defaults.ssl = false;

// ROUTES
app.use(express.static(path.join(__dirname, "/public")));
app.use("/auth", require("./server/routes/jwtAuth"));
//GET ALL PARTICIPANTS
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.post("/resetpassword", async (req, res) => {
    try {
        const body = JSON.parse(JSON.stringify(req.body))

        const {email, password, confirmpassword} = body;
        //step two: does the user already exist? throw error

        const user = await pool.query("SELECT * from salesforce.participant__c where email__c = $1 ", [email]);
        console.log('user' + user.rows.length);
        if(user.rows.length === 0){
            console.log('does not exist')
        }else{
            const salt = await bcrypt.genSalt(10);

            const bcryptPassword = await bcrypt.hash(password, salt);

            //step four: enter new user in db
            console.log('after bcrypt');

            const newParticipant = await pool.query
            ("Update salesforce.participant__c SET participant_password__c = $1 WHERE email__c = $2 RETURNING *", [bcryptPassword, email]);
            //step five: generate token

            const token = jwtGenerator(newParticipant.rows[0].externalid__c);
            console.log('success');
            return res.json({ token });
        }
        

    }catch(error){
        console.log(error.message);
        
    }
})

//GET ALL PARTICIPANTS

app.get("/participants", async (req, res) => {
    try {
        const allParticipants = await pool.query("SELECT * FROM salesforce.participant__c");
        res.json(allParticipants.rows)
    } catch (err) {
        console.log('eerrr' + err.message);
    }
});

//GET  PARTICIPANT

app.post("/profile", authorization, async (req, res) => {
    try {
        const participant = await pool.query("SELECT * FROM salesforce.participant__c WHERE ExternalId__c = $1", [req.user.id]);
        res.json(participant.rows[0]);
    } catch (err) {
        console.log('err profile::' + err);
    }
});

//UPDATE participant

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

//GET my contests

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

//GET ALL contests

app.get("/allcontests", authorization, async (req, res) => {
    try {
        //gets all contests in the future
        const allContests = await pool.query("SELECT * FROM salesforce.contest__c WHERE status__c != 'Finished' AND start_time__c > now() ORDER BY start_time__c ASC");
        res.json(allContests.rows);

    } catch (err) {
        console.log('error all contests' + err.message);
    }
});

//GET event

app.get("/event/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const event = await pool.query("SELECT * FROM salesforce.event__c AS event, salesforce.team__c AS team WHERE event.sfid = $1 AND (event.home_team__c = team.sfid OR event.away_team__c = team.sfid)", [id]);
        res.json(event.rows);
    } catch (err) {
        console.log('error get event: ' + err);
    }
});


//GET A Contest by Id

app.get("/contestdetail/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const contest = await pool.query("SELECT * FROM salesforce.contest__c WHERE sfid = $1", [id]);
        res.json(contest.rows[0]);
    } catch (err) {
        console.log('error get contest: ' + req.params);
    }
});


//CREATE participation (when a contest is selected)

app.post("/participations", authorization, async (req, res) => {
    try {
        //request user expires, find another way
        const {contest_id, contest_locked} = req.body;
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id, req.user.id]);
        if (part.rows.length != 0) {
            res.json(part.rows[0]);
            return res.status(401).send("Already Exists");
        }

        const con = await pool.query("SELECT * FROM salesforce.contest__c WHERE sfid = $1", [contest_id]);
        console.log('con' + JSON.stringify(con.rows[0]));
        if(con.rows[0].islocked__c){
            console.log('locked contest');
            return res.json({ a: 1 });
        }else{
            const newParticipation = await pool.query(
                "INSERT INTO salesforce.participation__c (Contest__c, Participant__r__ExternalId__c,Status__c, externalid__c) VALUES($1,$2,$3, gen_random_uuid()) RETURNING *",
                [contest_id, req.user.id, 'Active']
            );
           
            res.json(newParticipation.rows[0]);
        }
        
    } catch (err) {
        console.log('error participations' + err.message);
    }
});

//GET All Participations for a contest

app.get("/contestparticipations/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        const part = await pool.query("SELECT * FROM salesforce.participant__c AS participant, salesforce.participation__c AS participation WHERE participation.contest__c = $1 AND participation.participant__r__externalid__c = participant.externalid__c::text;", [contest_id]);
        res.json(part.rows);
    } catch (err) {
        console.log('err all participations by contest::' + err);
    }
});


//get participation by contest Id

app.get("/participationbycontest/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;

        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id, req.user.id]);
        
        res.json(part.rows[0]);
    } catch (err) {
        console.log('err participation by contest' + err);
    }
});


//Get published contest questions

app.get("/questions/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        
        const allContestQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true ORDER BY Name ASC", [contest_id]);
        res.json(allContestQuestions.rows)

    } catch (error) {
        console.log('error contest questions :: ' + error.message);
    }
});

//Get all contest questions

app.get("/allquestions/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        
        const allContestQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 ORDER BY Name ASC", [contest_id]);
        res.json(allContestQuestions.rows)

    } catch (error) {
        console.log('error contest questions :: ' + error.message);
    }
});


//disable questions on times up or locked

app.post("/disablequestions/", authorization, async (req, res) => {
    try {
        const {conid} = req.body;

        const lockContest = await pool.query("UPDATE salesforce.contest__c SET islocked__c = true WHERE sfid = $1", [conid]
        );
        
        const allContestQuestions = await pool.query("UPDATE salesforce.question__c SET islocked__c = true WHERE published__c = true AND contest__c = $1 RETURNING *", [conid]
        );

        var idlist = [];
        for(var i = 0; i < allContestQuestions.rows.length; i++){
            idlist.push(allContestQuestions.rows[i].sfid);
        }
        
        const selectQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE sfid = ANY ($1) ORDER BY Name ASC", [idlist]);
       
        res.json(selectQuestions.rows)

    } catch (error) {
        console.log('error disable questions :: ' + error.message);
    }
});

//get subsegment question count
//this isn't needed for MVP

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

//Get Participation for wrong answer count

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

//Get participation answers based on participations and questions

app.get("/existingpartanswer/:partsfid/question/:questid", authorization, async (req, res) => {
    try {
        const {partsfid, questid} = req.params;
        const participationExistAnswer = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE participation__c = $1 AND question__c = $2 ", [partsfid, questid]);
        res.json(participationExistAnswer.rows[0]);
    } catch (err) {
        console.log('existing part answer error ' + err);
    }

});

app.post("/existingpartanswernoquestion/", authorization, async (req, res) => {
    try {
        console.log('in parts answers existing');
        const {partsfid} = req.body;
        console.log(partsfid);
        const participationAnswer = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE participation__c = $1 ORDER BY name ASC", [partsfid]);
        if(participationAnswer.rows.length === 0 ){
            console.log('no rows');
        }
        res.json(participationAnswer.rows);
    } catch (err) {
        console.log('all part answer error ' + err);
    }

});

//Get Remaining participations at end of contest

app.get("/allendingparticipations/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        const contestwoncount = await pool.query(
            "SELECT * FROM salesforce.participation__c WHERE contest__c = $1 ORDER BY wrong_answers__c ASC",
            [contest_id]
        );
        if (contestwoncount.rows.length === 0) {
        } else {
            res.json(contestwoncount.rows);
        }
    } catch (err) {
        console.log('all remaining parts error::' + err);
    }
});


//put this in Apex?

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

// PG Promise to insert participation answers

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


if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')) // relative path
    })
}

pgListen.connect();

pgListen.events.on("connected", e => {
    console.log('connected' + e);
});

pgListen.events.on("reconnect", e => {
    console.log('pg Listen reconnect' + e);
});


pgListen.notifications.on("new_contest", (e) => {
    console.log('pg listen');
    console.log('emit'+e);
    if(e.status__c !== 'Finished'){
        console.log('calling new contest');
        io.to(e.contest__c).emit("new_contest", e)
    }
})

pgListen.notifications.on('test', e =>{
    console.log('on e');
    io.emit("test", e)
});

pgListen.notifications.on("new_question", (e) => {
    console.log('emit' + e);
    console.log('calling new question');
    if (e !== undefined && e.published__c && !e.islocked__c) {
        console.log('entered new question emit');
        io.emit("new_question", e)
    }

    if(e.correct_answer__c !== null && e !== undefined) {
        console.log('entered correct question emit');
        io.emit("cor_question", e)
    }
    
})


pgListen.events.on("error", (error) => {
    console.error("Fatal database connection error:", error)
    process.exit(1)
})

io.on("connection", async (socket) => {
    console.log('socket connection');
    pgListen.listenTo("new_question");
    pgListen.listenTo("cor_question");
    pgListen.listenTo("new_contest");
    console.log('listening');
    // socket.on("disconnect", (reason) => {

    // });
});



console.log('after listen to');
pgListen.listenTo("new_contest");
pgListen.listenTo("new_question");
pgListen.listenTo("cor_question");

io.on('connect_error', function(err) {
    console.log("client connect_error: ", err);
});

io.on('connect_timeout', function(err) {
    console.log("client connect_timeout: ", err);
});

http.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}`);
});
