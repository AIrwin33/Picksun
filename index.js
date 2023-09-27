const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

// TODO: add this env variables
const env = process.env.NODE_ENV || 'development';
const publicUrl = env === 'development' ? 'http://localhost:3000' : process.env.PUBLIC_URL;

const io = new Server(server, {
    cors: {
        origin: publicUrl,
    }
});






const {pool, pgListen} = require("./server/db");
const authorization = require("./server/utils/authorize");
const session = require("express-session")({
    secret: "new-secret",
    resave: true,
    saveUninitialized: true
  });


const path = require('path');
const { WSAEINVAL } = require('constants');

app.use(cors());
app.use(express.json());
app.use(session);
// serve static files
app.use(express.static('public'));
// create a route
app.use("/auth",require('./server/routes/jwtAuth'));



app.post("/myprofile", authorization, async (req, res) => {
    try {
    
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

app.post("/participations", authorization, async (req, res) => {
    try {
        //request user expires, find another way

        const {contest_id} = req.body;

        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id, req.user.id]);

        
        if (part.rows.length != 0) {
            res.json(part.rows[0]);
            return res.status(401).send("Already Exists");
        }

        const newParticipation = await pool.query(
            "INSERT INTO salesforce.participation__c (Contest__c, Participant__r__ExternalId__c,Status__c, externalid__c, wrong_answers_allowed__c, wrong_answers__c) VALUES($1,$2,$3, gen_random_uuid(), $4, $5) RETURNING *",
            [contest_id, req.user.id, 'Active', 4, 0]
        );

        res.json(newParticipation.rows[0]);
    } catch (err) {
        console.log('error participations' + err.message);
    }
});

app.post("/participationswronganswer", async (req, res) => {
    try {
        const {partid} = req.body;

        const participationWrongAnswer = await pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [partid]);
        

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

app.get("/event/:id", authorization, async (req, res) => {
    try {
        const {id} = req.params;
        const event = await pool.query("SELECT * FROM salesforce.event__c AS event, salesforce.team__c AS team WHERE event.sfid = $1 AND (event.home_team__c = team.sfid OR event.away_team__c = team.sfid)", [id]);
        res.json(event.rows);
    } catch (err) {
        console.log('error get event: ' + err);
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

app.post("/disablequestions/", authorization, async (req, res) => {
    try {
        const {conid} = req.body;
        
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

app.get("/allquestions/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        
        const allContestQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 ORDER BY Name ASC", [contest_id]);
        res.json(allContestQuestions.rows)

    } catch (error) {
        console.log('error contest questions :: ' + error.message);
    }
});

app.post("/markcorrect", authorization, async (req, res) => {
    try {

        const {questsfid, selectanswer, answerval, con} = req.body;
        //update question correct answer
        console.log(selectanswer);
        console.log(answerval);
        console.log(questsfid);
        const updatequestion = await pool.query(
            "UPDATE salesforce.question__c SET correct_answer__c = $1, correct_answer_value__c = $2 WHERE sfid = $3 RETURNING *",
            [selectanswer, answerval, questsfid]
        );
        console.log(updatequestion.rows);
        const selectedpartanswers = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE question__c = $1", [questsfid]);
        var incorrectlist = [];
        var partidlist = [];
        
        console.log('check 1');
        for(var i=0; i < selectedpartanswers.rows.length; i++){
            console.log('i' + i);
            console.log(selectedpartanswers.rows[0]);
            console.log(selectedpartanswers.rows[i]);
            if(selectedpartanswers.rows[i].selection__c == selectanswer){
                selectedpartanswers.rows[i].validated__c = true;
                selectedpartanswers.rows[i].correct__c = true;
            }else if(selectedpartanswers.rows[i].status__c === 'Not Submitted'){
                selectedpartanswers.rows[i].validated__c = true;
                selectedpartanswers.rows[i].incorrect__c = true;
                selectedpartanswers.rows[i].status__c = 'Did Not Answer';
                incorrectlist.push(selectedpartanswers.rows[i]);
                console.log(selectedpartanswers.rows[i].participation__c);
                partidlist.push(selectedpartanswers.rows[i].participation__c);
                console.log(partidlist);
            }else{
                selectedpartanswers.rows[i].validated__c = true;
                selectedpartanswers.rows[i].incorrect__c = true;
                incorrectlist.push(selectedpartanswers.rows[i]);
                console.log(selectedpartanswers.rows[i].participation__c);
                partidlist.push(selectedpartanswers.rows[i].participation__c);
            }
        }
        console.log('check 2');
        res.json(selectedpartanswers.rows);
        console.log(partidlist);
        const incorrectparts = await pool.query("SELECT * FROM salesforce.participation__c WHERE sfid = ANY ($1)", [partidlist]);
        
        for(var i=0; i < incorrectparts.length; i++){
            for(var k=0; k < incorrectlist.length; k++){
                if(incorrectparts[i].sfid == incorrectlist[k].participation__c){
                    incorrectparts[i].Wrong_Answers__c += 1;
                    if(incorrectparts[i].wrong_answers__c == conallowed.wrong_answers_allowed__c){
                        incorrectparts[i].status__c = 'Knocked Out';
                      
                  }
                }
            }
        }
        console.log('check 3');
        const allcontestquestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND correct_answer__c != ''", [con.sfid]);
        const activeparts = await pool.query("SELECT * FROM salesforce.participation__c WHERE status__c = 'Active' AND contest__c = $1", [con.sfid]);
        console.log(activeparts.rows.length);
        console.log(allcontestquestions.rows.length);
            if(con.Number_of_Questions__c == allcontestquestions.rows.length || (activeparts.rows.length == 1)){
                console.log('check 4');
                system.debug('in finish con');
                //finishContest(con);
                const con = await pool.query("UPDATE salesforce.contest__c SET status__c = 'Finished' WHERE Id = $1", [con.sfid]);

                const finishedparts = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 ORDER BY Wrong_Answers__c ASC", [con.sfid]);
                var place = 1;
                var index = 0;
                var indexless = index - 1;
                var participantid;
                console.log('check 5');
                for(var i=0; i < finishedparts.length; i++){
                    if(index > 0 && indexless >= 0){
                        if(finishedParts[index].wrong_answers__c > finishedparts[indexless].wrong_answers__c){
                            console.log('increment place');
                            place = place + 1;
                        }
                    }

                    finishedparts[i].PlaceFinish__c = place;
                    if(finishedparts[i].Status__c == 'Knocked Out'){
                        
                    }else{
                        finishedparts[i].Status__c = 'Inactive';
                    }
                    
                    index = index + 1;
                    indexless = indexless + 1;
                    
                    if(finishedparts[i].placefinish__c == 1){
                        participantid = finishedparts[i].participant__c;
                    }
                }
                if(participantid != null){
                    console.log('part:::' + participantId);
                    var winval;
                    const contestswon = await pool.query("SELECT * FROM salesforce.participant__c WHERE Id = $1", [participantId]).contests_won__c;
                    if(contestswon == null){
                        winval = 0;
                    }
                    winval = contestswon + 1;

                    const winningpart = await pool.query("UPDATE salesforce.participant__c SET status = 'Finished', Contests_Won__c = $1 WHERE Id = $2", [winval, participantId]);
                    console.log('check 6');
                }
            }

    } catch (error) {
        console.log('error mark correct :: ' + error.message);
    }
});

app.get("/questions/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;

        const allContestQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true ORDER BY Name ASC", [contest_id]);

        res.json(allContestQuestions.rows)

    } catch (error) {
        console.log('error contest questions :: ' + error.message);
    }
});

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

        const {partsfid} = req.body;

        const participationAnswer = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE participation__c = $1 ORDER BY name ASC", [partsfid]);
        if(participationAnswer.rows.length === 0 ){

        }
        res.json(participationAnswer.rows);
    } catch (err) {
        console.log('all part answer error ' + err);
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


app.post("/publishcontest", authorization, async (req, res) => {
    try {
        const {contest_id} = req.body;
        const time = new Date();

        const pubquest = await pool.query(
            "UPDATE salesforce.Question__c SET published__c = true WHERE contest__c = $1", [contest_id]
        );
        
        

        const pubcon = await pool.query(
            "UPDATE salesforce.Contest__c SET Opened_Timer__c = $1 WHERE sfid = $2", [contest_id, time]
            );
        
       
        res.json(pubcon);
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





io.on("connection", (socket) => {
    console.log('connected' + socket);

    socket.on("new_contest", function(data) {
        console.log(data);
        if(data.status__c === 'Finished'){
            socket.broadcast.to(data.contest__c).emit("new_contest", data);
        }
    });

    socket.on("new_question", function(data) {
        console.log('new questions' + data);
        if (data !== undefined && data.published__c && !data.islocked__c) {
            socket.emit("new_question", data)
        }
    
        if(data.correct_answer__c !== null && data !== undefined) {
            socket.emit("cor_question", data)
        }
    });

    socket.on("new_contest", function(data) {
        if(data.status__c === 'Finished'){
            socket.broadcast.to(data.contest__c).emit("new_contest", data)
        }
    });

    socket.on('disconnect', () => {
        console.log(`disconnect: ${socket.id}`);
      });
});
    



const port = process.env.PORT || 5432;
server.listen(port, () => {
  console.log('listening on *:' + port);
});