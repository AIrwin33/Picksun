require("dotenv").config();
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
        origin: [
            publicUrl || 'https://play.pick.fun',
            'https://cryptic-citadel-94967.herokuapp.com'
        ],
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
        
        console.log('parts wrong answers' + JSON.stringify(participationWrongAnswer.rows));
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
        console.log('get contest parts' + contest_id);
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

app.post("/markcorrect", authorization, async (req, res) => {
    try {

        const {questsfid, selectanswer, answerval, con} = req.body;
        //update question correct answer

        const updatequestion = await pool.query(
            "UPDATE salesforce.question__c SET correct_answer__c = $1, correct_answer_value__c = $2 WHERE sfid = $3 RETURNING *",
            [selectanswer, answerval, questsfid]
        );

        
        const selectedpartanswers = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE question__c = $1", [questsfid]);
        var incorrectlist = [];
        var partidlist = [];
        
        console.log('check 1');
        for(var i=0; i < selectedpartanswers.rows.length; i++){

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
            console.log('parts id list' + partidlist);
            const selectedpartanswers2 = await pool.query("UPDATE salesforce.participation_answers__c SET validated__c = $1, incorrect__c = $2, status__c = $3, correct__c = $4 WHERE id = $5", [selectedpartanswers.rows[i].validated__c, selectedpartanswers.rows[i].incorrect__c, selectedpartanswers.rows[i].status__c, selectedpartanswers.rows[i].correct__c, selectedpartanswers.rows[i].id]);
            console.log(selectedpartanswers2.rows);
        }
        console.log('check 2');
        const selectedpartanswers1 = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE question__c = $1", [questsfid]);
        
        console.log(selectedpartanswers1.rows);
        console.log(selectedpartanswers.rows);
        res.json(selectedpartanswers.rows);


        
        const incorrectparts = await pool.query("SELECT * FROM salesforce.participation__c WHERE sfid = ANY ($1)", [partidlist]);

        for(var i=0; i < incorrectparts.rows.length; i++){
            for(var k=0; k < incorrectlist.length; k++){
                console.log(incorrectparts.rows[i].wrong_answers__c);
                if(incorrectparts.rows[i].sfid == incorrectlist[k].participation__c){
                    
                    incorrectparts.rows[i].wrong_answers__c += 1;
                    console.log(incorrectparts.rows[i].wrong_answers__c);
                    if(incorrectparts.rows[i].wrong_answers__c == con.wrong_answers_allowed__c){
                        incorrectparts.rows[i].status__c = 'Knocked Out';
                      
                  }
                }
                const incorrectrows = await pool.query("UPDATE salesforce.participation__c SET wrong_answers__c = $1 WHERE id = $2 RETURNING *", [incorrectparts.rows[i].wrong_answers__c, incorrectparts.rows[i].id]);
                console.log('incorrectrows' + incorrectrows.rows);
            }
        }

        console.log('check 3');
        console.log(con.sfid);
        const allcontestquestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND correct_answer__c IS NOT NULL", [con.sfid]);
        const activeparts = await pool.query("SELECT * FROM salesforce.participation__c WHERE status__c = 'Active' AND contest__c = $1", [con.sfid]);
        console.log(con.number_of_questions__c);
        console.log(allcontestquestions.rows.length);
        console.log(activeparts.rows.length);
            if((con.number_of_questions__c == allcontestquestions.rows.length) || activeparts.rows.length == 1){
                console.log('check 4');

                const cont = await pool.query("UPDATE salesforce.contest__c SET status__c = 'Finished' WHERE sfid = $1", [con.sfid]);

                const finishedparts = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 ORDER BY Wrong_Answers__c ASC", [con.sfid]);
                var place = 1;
                var index = 0;
                var indexless = index - 1;
                var participantid;
                console.log('check 5');
                console.log(finishedparts.rows.length);
                console.log(finishedparts.rows)
                for(var i=0; i < finishedparts.rows.length; i++){
                    if(index > 0 && indexless >= 0){
                        if(finishedparts.rows[index].wrong_answers__c > finishedparts.rows[indexless].wrong_answers__c){
                            console.log('increment place');
                            place = place + 1;
                        }
                    }

                    finishedparts.rows[i].placefinish__c = place;
                    if(finishedparts.rows[i].Status__c == 'Knocked Out'){
                        
                    }else{
                        finishedparts.rows[i].Status__c = 'Inactive';
                    }
                    console.log(finishedparts.rows[i].placefinish__c);
                    index = index + 1;
                    indexless = indexless + 1;
                    const allfinishedparts = await pool.query("UPDATE salesforce.participation__c SET placefinish__c = $1 WHERE id = $2 RETURNING *", [finishedparts.rows[i].placefinish__c, finishedparts.rows[i].id]);
                    if(finishedparts.rows[i].placefinish__c == 1){
                        participantid = finishedparts.rows[i].participant__c;
                        console.log('part:::' + participantid);
                        var winval;
                        const contestswon = await pool.query("SELECT * FROM salesforce.participant__c WHERE sfid = $1", [participantid]).contests_won__c;
                        if(contestswon == null){
                            winval = 0;
                        }
                        winval = contestswon + 1;

                        const winningpart = await pool.query("UPDATE salesforce.participant__c SET contests_won__c = $1 WHERE sfid = $2", [winval, participantid]);
                        console.log('check 6');
                        }
                }
            }
        io.to("contestroom").emit("cor_question", updatequestion);
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
        console.log(JSON.stringify(participationExistAnswer.rows[0]));
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
        const epochtime = Date.parse(time);
        const pubquest = await pool.query(
            "UPDATE salesforce.Question__c SET published__c = true WHERE contest__c = $1 RETURNING *", [contest_id]
        );
        
        io.to("contestroom").emit("new_question", pubquest);

        const pubcon = await pool.query(
            "UPDATE salesforce.Contest__c SET opened_timer__c = $1 WHERE sfid = $2 RETURNING *", [epochtime, contest_id]
            );
        
        io.to("contestroom").emit("new_contest", pubcon.rows[0]);
        res.json(pubcon.rows[0]);
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


io.on("connection", (socket) => {
    console.log('connected' + socket);
    socket.join("contestroom");
});
    



const port = process.env.PORT || 5432;
server.listen(port, () => {
  console.log('listening on *:' + port);
});