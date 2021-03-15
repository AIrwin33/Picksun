const express = require("express");
const app = express();
const pool = require("./db");
require("dotenv").config();
//middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());
const authorization = require("./middleware/authorize");
const PORT = process.env.PORT || 5000;
const path = require("path");

//process.env.PORT = 
// process.env.NODE_ENV

if (process.env.NODE_ENV === "production") {
    //server static content
    //npm run build
    app.use(express.static("./client/build"));
  }

// ROUTES

app.use("/auth", require("./routes/jwtAuth"));
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

//update participant

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

//get my contests

app.get("/mycontests", authorization, async(req, res) => {
    try{
        //get all participations based on external ID
        const mycontests = await pool.query("SELECT * FROM salesforce.participation__c AS participation, salesforce.contest__c AS contest WHERE external_participant__c = $1 AND contest.sfid = participation.contest__c",
        [req.user.id]);

        console.log(JSON.stringify(mycontests.rows));
        //get all contests based on participations
        //const allContests = await pool.query("SELECT * FROM salesforce.contest__c WHERE id = ANY(allParticipations.map(part => part.contest_id)");
        
        res.json(mycontests.rows);
  
  }catch(err){
      console.log('eerrr' + err.message);
  }
  });

//get contests

app.get("/contests", async(req,res) => {
  try{
      //gets all contests in the future
    const allContests = await pool.query("SELECT * FROM salesforce.contest__c");
    res.json(allContests.rows);

}catch(err){
    console.log('eerrr' + err.message);
}
});

//get event

app.get("/event/:id/", async(req,res) => {
    try{
        const {id} = req.params;
        const event = await pool.query("SELECT * FROM salesforce.event__c AS event, salesforce.team__c AS team WHERE event.sfid = $1 AND (event.home_team__c = team.sfid OR event.away_team__c = team.sfid)", [id]);
        res.json(event.rows);
        console.log(event.rows);
    }catch(err) {
        console.log('error get event: ' + err);
    }
});


//get specific contest

app.get("/contest/:id/", async(req,res) => {
    try{
        const {id} = req.params;
        console.log('contest id ' + id);

        const contest = await pool.query("SELECT * FROM salesforce.contest__c WHERE id = $1", [id]);
        res.json(contest.rows[0]);
        
    }catch(err) {
        console.log('error get contest: ' + err);
    }
});


//create participation (when a contest is selected)

app.post("/participations", authorization, async(req, res) => {
  try {
      //request user expires, find another way
      const {contest_id} = req.body;
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND external_participant__c = $2", [contest_id,req.user.id]);
        

        if(part.rows.length != 0){
            res.json(part.rows[0]);
            //return res.status(401).send("Already Exists");
        }

      //in production org, - include sfid for participant__c, for now, just include external_participant__c;
       
        //figure how to pass dynamic participant id here

        //once participations are created, send update back to SF?
        
      const newParticipation = await pool.query(
          "INSERT INTO salesforce.participation__c (contest__c, external_participant__c,status__c, ExternalId__c) VALUES($1,$2,$3, gen_random_uuid()) RETURNING *", 
      [contest_id, req.user.id, 'Active']
      );
      
      res.json(newParticipation.rows[0]);
  }catch(err){
      console.log('error participations' + err.message);
  }
});

//get all participations for a contest

app.get("/contestparticipations/:contest_id", authorization, async(req,res) => {
    try{
        const {contest_id} = req.params;

        const part = await pool.query("SELECT * FROM salesforce.participation__c AS participation, salesforce.participant__c AS participant WHERE participation.contest__c = $1 AND participation.external_participant__c = participant.participant_id::text;", [contest_id]);
        res.json(part.rows);
        console.log('all parts in contest' + JSON.stringify(part.rows));
    }catch(err) {
        console.log('err' + err);
    }
});


//get participation by contest Id and participant

app.get("/participationbycontest/:contest_id", authorization, async(req,res) => {
    try{
        const {contest_id} = req.params;
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND external_participant__c = $2", [contest_id,req.user.id]);
        res.json(part.rows[0]);
    }catch(err) {
        console.log('err part by contest' + err);
    }
});

//get participation

app.get("/participations/:id", async(req,res) => {
    try{
        const {id} = req.params;
        console.log(id);

        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE id = $1", [id]);
        res.json(part.rows[0]);
    }catch(err) {
        console.log('err' + err);
    }
});



//get contest questions

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

app.post("/disablequestions/", async(req,res) => {
    try {
        const { questionids } = req.body;
        console.log(questionids);
        const allContestQuestions = await pool.query( "UPDATE salesforce.question__c SET IsLocked__c = true WHERE sfid = ANY ($1)", [questionids]
        );
          res.json(allContestQuestions.rows)
            console.log('updated all questions');
    }catch(error){
      console.log('message :: ' + error.message);
    }
  });

//create participation answers?

app.post("/answers", async(req, res) => {
  try {

      const {partid, question_id, eventVal} = req.body;

      const newParticipationAnswer = await pool.query(
          "INSERT INTO salesforce.participation_answers__c (participation__c, question__c, selection__c, status__c, ExternalId__c) VALUES($1,$2,$3,$4, gen_random_uuid()) RETURNING *", 
      [partid, question_id, eventVal, 'Submitted']
      );
      res.json(newParticipationAnswer.rows[0]);
  }catch(err){
      console.log('err' + err.message);
  }
});

app.get("*", (req, res) => {
    res.sendFile("./client/build/index.html");
  });


app.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}`);
  });
