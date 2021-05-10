const express = require("express");
const app = express();
const pool = require("./server/db");

var bodyParser = require('body-parser')
require("dotenv").config();
//middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());
const authorization = require("./server/middleware/authorize");
const PORT = process.env.PORT || 8080;
const path = require("path");

//process.env.PORT = 
// process.env.NODE_ENV


// ROUTES
app.use(express.static(path.join(__dirname, "/public")));
app.use("/auth", require("./server/routes/jwtAuth"));
//GET ALL PARTICIPANTS

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//GET ALL PARTICIPANTS


app.get("/participants", async(req,res) => {
    try{
        const allParticipants = await pool.query("SELECT * FROM salesforce.participant__c");
        res.json(allParticipants.rows)
    }catch(err){
        console.log('eerrr' + err.message);
    }
});

//GET  PARTICIPANT

app.post("/profile", authorization, async(req,res) => {
  try{
    const participant = await pool.query("SELECT * FROM salesforce.participant__c WHERE ExternalId__c = $1", [req.user.id]);
    res.json(participant.rows[0]);
  }catch(err) {
      console.log('err profile?' + err);
  }
});

//UPDATE participant

app.put("/participant/:id", async(req,res) => {
    try {

        const {id} = req.params;
        const {favorite_team, favorite_sport, favorite_player} = req.body;
        const updatePart = await pool.query(
            "UPDATE salesforce.participant__c SET favorite_team__c = $1, favorite_sport__c = $2, favorite_player__c = $3 WHERE ExternalId__c = $4", 
        [favorite_team, favorite_sport, favorite_player, id]
        );
        res.json('participant was updated');
    }catch(err){
        console.log('err' + err.message);
    }
});

//GET my contests

app.get("/mycontests", authorization, async(req, res) => {
    try{
        //get all participations based on external ID
        console.log('in my contests');
        const mycontests = await pool.query("SELECT * FROM salesforce.participation__c AS participation, salesforce.contest__c AS contest WHERE participation.participant__r__externalid__c = $1 AND contest.sfid = participation.contest__c",
        [req.user.id]);
        //get all contests based on participations?
        //const allContests = await pool.query("SELECT * FROM salesforce.contest__c WHERE id = ANY(allParticipations.map(part => part.contest_id)");
        
        res.json(mycontests.rows);
  
  }catch(err){
      console.log('eerrr' + err.message);
  }
  });

//GET ALL contests

app.get("/allcontests", authorization, async(req,res) => {
  try{
      console.log('in all contests');
      //gets all contests in the future
    const allContests = await pool.query("SELECT * FROM salesforce.contest__c WHERE start_time__c > now()");
    console.log(JSON.stringify(allContests.rows));
    res.json(allContests.rows);

}catch(err){
    console.log('eerrr contests' + err.message);
}
});

//GET event

app.get("/event/:id", authorization, async(req,res) => {
    try{
        const {id} = req.params;
        console.log('id' + id);
        const event = await pool.query("SELECT * FROM salesforce.event__c AS event, salesforce.team__c AS team WHERE event.sfid = $1 AND (event.home_team__c = team.sfid OR event.away_team__c = team.sfid)", [id]);
        res.json(event.rows);
        console.log(event.rows);
    }catch(err) {
        console.log('error get event: ' + err);
    }
});


//GET A Contest by Id

app.get("/contestdetail/:id", async(req,res) => {
    try{
        const {id} = req.params;
        console.log('contest id ' + id);

        const contest = await pool.query("SELECT * FROM salesforce.contest__c WHERE sfid = $1", [id]);
        console.log(contest.rows);
        res.json(contest.rows[0]);
        console.log('after response');
    }catch(err) {
        console.log('error get contest: ' + req.params);
    }
});


//CREATE participation (when a contest is selected)

app.post("/participations", authorization, async(req, res) => {
  try {
      //request user expires, find another way
      const {contest_id} = req.body;
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id,req.user.id]);
        console.log(part.rows.length);

        if(part.rows.length != 0){
            res.json(part.rows[0]);
            return res.status(401).send("Already Exists");
        }

      const newParticipation = await pool.query(
          "INSERT INTO salesforce.participation__c (Contest__c, Participant__r__ExternalId__c,Status__c, externalid__c) VALUES($1,$2,$3, gen_random_uuid()) RETURNING *", 
      [contest_id, req.user.id, 'Active']
      );
      console.log('new participation' + JSON.stringify(newParticipation.rows[0]));
      res.json(newParticipation.rows[0]);
  }catch(err){
      console.log('error participations' + err.message);
  }
});

//GET All Participations for a contest

app.get("/contestparticipations/:contest_id", authorization, async(req,res) => {
    try{
        const {contest_id} = req.params;
        console.log('all contest participations');
        const part = await pool.query("SELECT * FROM salesforce.participant__c AS participant, salesforce.participation__c AS participation WHERE participation.contest__c = $1 AND participation.participant__r__externalid__c = participant.externalid__c::text;", [contest_id]);
        res.json(part.rows);
    }catch(err) {
        console.log('err' + err);
    }
});


//get participation by contest Id

app.get("/participationbycontest/:contest_id", authorization, async(req,res) => {
    try{
        const {contest_id} = req.params;
        console.log('parts by contest id' + contest_id);
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id,req.user.id]);
        console.log('participations list' + JSON.stringify(part.rows));
        res.json(part.rows[0]);
    }catch(err) {
        console.log('err part by contest' + err);
    }
});

//GET participation

app.get("/participations/id", async(req,res) => {
    try{
        const {id} = req.params;
        console.log(id);

        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [id]);
        res.json(part.rows[0]);
    }catch(err) {
        console.log('err' + err);
    }
});



//GET contest questions

app.get("/questions/:contest_id", authorization, async(req,res) => {
  try {
      const { contest_id } = req.params;
      console.log('contest id for questions' + contest_id);
      const allContestQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true", [contest_id]);
        res.json(allContestQuestions.rows)

  }catch(error){
    console.log('message :: ' + error.message);
  }
});


//disable questions on times up or locked

app.post("/disablequestions/", authorization, async(req,res) => {
    try {
        const { questionids } = req.body;
        const allContestQuestions = await pool.query( "UPDATE salesforce.question__c SET islocked__c = true WHERE sfid = ANY ($1) RETURNING *", [questionids]
        );
          res.json(allContestQuestions.rows)
            
    }catch(error){
      console.log('message :: ' + error.message);
    }
  });

//create participation answers?

app.post("/answers", async(req, res) => {
  try {

      const {partid, question_sfid, eventVal, eventLabel, expartid} = req.body;
      const participation = await pool.query(
        "SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", 
    [expartid]
    );
        console.log(expartid);
        console.log(participation.rows[0].sfid);
        console.log(participation.rows);
        console.log('partid in creating answer');
      const newParticipationAnswer = await pool.query(
          "INSERT INTO salesforce.participation_answers__c (participation__c, question__c, selection__c, selection_value__c, status__c, ExternalId__c) VALUES($1,$2,$3,$4,$5, gen_random_uuid()) RETURNING *", 
      [participation.rows[0].sfid, question_sfid, eventVal, eventLabel, 'Submitted']
      );
      res.json(newParticipationAnswer.rows[0]);
  }catch(err){
      console.log('err' + err.message);
  }
});

//SET validated answer


app.post("/validatepartanswer", async(req, res) => {
    try {
  
        const {partanswerid} = req.body;
          console.log('partid in creating answer' +partanswerid);
        const validParticipationAnswer = await pool.query(
            "UPDATE salesforce.participation_answers__c SET validated__c = true WHERE sfid = $1 RETURNING *", 
        [partanswerid]
        );
        console.log('validated answer' +validParticipationAnswer.rows[0]);
        res.json(validParticipationAnswer.rows[0]);
    }catch(err){
        console.log('err' + err.message);
    }
  });

//Get Participation for wrong answer count

app.post("/participationswronganswer", async(req, res) => {
    try {
        const {partid} = req.body;
        const participationWrongAnswer = await pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [partid]);
      res.json(participationWrongAnswer.rows[0]);
    }catch(err){
        console.log('wrong answer error ' + err);
    }

});

//REFACTOR - keep this?

app.get("/existingpartanswer/:partsfid/question/:questid", authorization, async(req, res) => {
    try {
        const {partsfid, questid} = req.params;
        console.log('starting existing answers');
        console.log('part id' + partsfid);
        console.log('questionid' + questid);
        const participationExistAnswer = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE participation__c = $1 AND question__c = $2 ", [partsfid, questid]);
        console.log('existing answer' + JSON.stringify(participationExistAnswer.rows[0]));
        res.json(participationExistAnswer.rows[0]);
    }catch(err){
        console.log('existing answer error ' + err);
    }

});

//REFACTOR - keep this?

app.post("/wronganswer", authorization, async(req, res) => {
    try {
        console.log('in wrong answers');
        const {partid} = req.body;
        console.log('external id' + partid);
        const wronganswercounter = await pool.query(
            "SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", 
        [partid]
        );
        console.log('part answer' + JSON.stringify(wronganswercounter.rows));
        var wronganswercount = 0;
        console.log('logs' + wronganswercounter.rows[0].wrong_answers__c);
        if(wronganswercounter.rows[0].wrong_answers__c === null || wronganswercounter.rows[0].wrong_answers__c === 0){
            wronganswercount = 1;
            console.log('number of wrong answers null' + wronganswercount);
        }else{
            wronganswercount = wronganswercounter.rows[0].wrong_answers__c;
            wronganswercount += 1;
            console.log('number of wrong answers' + wronganswercount);
        }
        console.log('number of wrong answers' + wronganswercount);
        const wronganswerpart = await pool.query(
          "UPDATE salesforce.participation__c SET wrong_answers__c = $1 WHERE externalid__c = $2 RETURNING *", 
      [wronganswercount, partid]
      );
      res.json(wronganswerpart.rows[0]);
    }catch(err){
        console.log('wrong answer error ' + err);
    }

});

//REFACTOR - keep this?

app.post("/clearcounter", authorization, async(req, res) => {
    try {
        const {conid} = req.body;
        const clearcounter = await pool.query( "UPDATE salesforce.contest__c SET Opened_Timer__c = null WHERE sfid = $1 RETURNING *", 
        [conid]);
        res.json(clearcounter.rows[0]);
    }catch(err){
        console.log('wrong answer error ' + err);
    }

});

//REFACTOR - keep this?

app.post("/updateOpenedTime/:contest_id", authorization, async(req, res) => {
    try {
        const {now} = req.body;
        console.log(now);

        const { contest_id } = req.params;
        console.log('update opened time' + contest_id);
        const openedtime = await pool.query(
          "UPDATE salesforce.contest__c SET Opened_Timer__c = $1 WHERE sfid = $2 RETURNING *", 
      [now, contest_id]
      );
      res.json(openedtime.rows[0]);
    }catch(err){
        console.log('wrong answer error ' + err);
    }

});

//Get Remaining participations at end of contest

app.get("/allendingparticipations/:contest_id", authorization, async(req, res) => {
    try{
        const contestwoncount = await pool.query(
            "SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND status__c = 'Active' SORT BY wrong_answers__c ASC", 
        [contest_id]
        );
        console.logs('rows remaining parts:' + contestwoncount.rows);
        res.json(contestwoncount.rows);
    }catch(err){
        console.log('all remaining parts error::' + err);
    }
});

app.post("/contestwon", authorization, async(req, res) => {
    try {
        //update contests won number and win rate number, place finish
        const {contestid, partsfid} = req.body;

        //run calcs based on previous numbers

        const wonparticipation = await pool.query(
            "UPDATE salesforce.participation__c SET PlaceFinish__c = 1, Status__c = 'Inactive' WHERE sfid = $1", 
        [partsfid]
        );

        const contestwoncount = await pool.query(
            "SELECT * FROM salesforce.participant__c WHERE sfid = $1", 
        [req.user.id]
        );
        
        var contestwonnewcount = contestwoncount + 1;
        const wonparticipant = await pool.query(
            "UPDATE salesforce.participant__c SET Contests_Won__c = $1 WHERE sfid = $2", 
        [contestwonnewcount, req.user.id]
        );

        const woncontest = await pool.query(
            "UPDATE salesforce.contest__c SET Status__c = 'Finished' WHERE sfid = $1", 
        [contestid]
        );
    }catch(err){
        console.log('contest won error ' + err); 
    }

});



//knockout

app.post("/knockout", async(req, res) => {
    try {
        const {partid} = req.body;
        
        const knockedoutpart = await pool.query(
            "UPDATE salesforce.participation__c SET Status__c = 'Knocked Out' WHERE ExternalId__c = $1", 
        [partid]
        );
        const contestId = knockedoutpart.rows[0].Contest__c;
        const contestText = await pool.query("SELECT * FROM salesforce.contest__c WHERE sfid = $1", [contestId]);

        //TODO lock all questions

      
      res.json(contestText);
    }catch(err){
        console.log('knock out error ' + err);
    }

});


if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/build'))
  
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'client', 'build', 'index.html')) // relative path
    })
  }

app.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}`);
  });
