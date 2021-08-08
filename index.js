const express = require("express");
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);
const {pool, pgListen} = require("./server/db");
const bodyParser = require('body-parser');
require("dotenv").config();
//middleware
const cors = require("cors");
app.use(cors());
app.use(express.json());
const authorization = require("./server/middleware/authorize");
const PORT = process.env.PORT || 8080;
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
        const allContests = await pool.query("SELECT * FROM salesforce.contest__c WHERE start_time__c > now()");
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
        const {contest_id} = req.body;
        const part = await pool.query("SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND participant__r__externalid__c = $2", [contest_id, req.user.id]);
        if (part.rows.length != 0) {
            res.json(part.rows[0]);
            return res.status(401).send("Already Exists");
        }

        const newParticipation = await pool.query(
            "INSERT INTO salesforce.participation__c (Contest__c, Participant__r__ExternalId__c,Status__c, externalid__c) VALUES($1,$2,$3, gen_random_uuid()) RETURNING *",
            [contest_id, req.user.id, 'Active']
        );
        console.log('new participation' + JSON.stringify(newParticipation.rows[0]));
        res.json(newParticipation.rows[0]);
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
        console.log(JSON.stringify(part.rows));
        res.json(part.rows[0]);
    } catch (err) {
        console.log('err participation by contest' + err);
    }
});

app.get("/questions/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        console.log('getting questions');
        const allContestQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true ORDER BY SubSegment__c ASC", [contest_id]);
        res.json(allContestQuestions.rows)

    } catch (error) {
        console.log('error contest questions :: ' + error.message);
    }
});


//disable questions on times up or locked

app.post("/disablequestions/", authorization, async (req, res) => {
    try {
        const {conid} = req.body;
        console.log('Disable questions ids' + conid);
        const allContestQuestions = await pool.query("UPDATE salesforce.question__c SET islocked__c = true WHERE contest__c = $1 AND published__c = TRUE RETURNING *", [conid]
        );
        console.log('disabled questions' + allContestQuestions.rows);
        res.json(allContestQuestions.rows)

    } catch (error) {
        console.log('error disable questions :: ' + error.message);
    }
});

//get subsegment question count

app.post("/countsubsegment/", authorization, async (req, res) => {
    try {
        const {conid, subseg} = req.body;
        console.log(conid);
        console.log(subseg);
        const subsegQuestions = await pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true AND SubSegment__c = $2", [conid, subseg]
        );
        console.log(subsegQuestions.rows);
        res.json(subsegQuestions.rows.length);

    } catch (error) {
        console.log('error disable questions :: ' + error.message);
    }
});

//create participation answers?

app.post("/answers", async (req, res) => {
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
    } catch (err) {
        console.log('error answers' + err.message);
    }
});


//Get Participation for wrong answer count

app.post("/participationswronganswer", async (req, res) => {
    try {
        const {partid} = req.body;
        const participationWrongAnswer = await pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [partid]);
        res.json(participationWrongAnswer.rows[0]);
    } catch (err) {
        console.log('participations wrong answer error ' + err);
    }

});

//REFACTOR - keep this?

app.get("/existingpartanswer/:partsfid/question/:questid", authorization, async (req, res) => {
    try {
        const {partsfid, questid} = req.params;
        const participationExistAnswer = await pool.query("SELECT * FROM salesforce.participation_answers__c WHERE participation__c = $1 AND question__c = $2 ", [partsfid, questid]);
        res.json(participationExistAnswer.rows[0]);
    } catch (err) {
        console.log('existing part answer error ' + err);
    }

});

//REFACTOR - keep this?

app.post("/wronganswer", authorization, async (req, res) => {
    try {
        const {partid} = req.body;
        const wronganswercounter = await pool.query(
            "SELECT * FROM salesforce.participation__c WHERE externalid__c = $1",
            [partid]
        );

        res.json(wronganswercounter.rows[0]);
    } catch (err) {
        console.log('wrong answer error ' + err);
    }

});

app.post("/clearcounter", authorization, async (req, res) => {
    try {
        const {conid} = req.body;
        const clearcounter = await pool.query("UPDATE salesforce.contest__c SET Opened_Timer__c = null WHERE sfid = $1 RETURNING *",
            [conid]);
        res.json(clearcounter.rows[0]);
    } catch (err) {
        console.log('clear counter error ' + err);
    }

});

//Get Remaining participations at end of contest

app.get("/allendingparticipations/:contest_id", authorization, async (req, res) => {
    try {
        const {contest_id} = req.params;
        const contestwoncount = await pool.query(
            "SELECT * FROM salesforce.participation__c WHERE contest__c = $1 AND status__c = $2 ORDER BY wrong_answers__c ASC",
            [contest_id, 'Active']
        );
        console.log('rows remaining parts:' + contestwoncount.rows[0]);
        if (contestwoncount.rows.length === 0) {
        } else {
            res.json(contestwoncount.rows);
        }
    } catch (err) {
        console.log('all remaining parts error::' + err);
    }
});

app.post("/contestwon", authorization, async (req, res) => {
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

        var contestwonnewcount = contestwoncount.Contests_Won__c + 1;
        const wonparticipant = await pool.query(
            "UPDATE salesforce.participant__c SET Contests_Won__c = $1 WHERE sfid = $2",
            [contestwonnewcount, req.user.id]
        );

        const woncontest = await pool.query(
            "UPDATE salesforce.contest__c SET Status__c = 'Finished' WHERE sfid = $1 RETURNING *",
            [contestid]
        );
        res.json(woncontest.rows);

    } catch (err) {
        console.log('contest won error ' + err);
    }

});


//knockout

app.post("/knockout", async (req, res) => {
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
    } catch (err) {
        console.log('knock out error ' + err);
    }

});


// PG Promise to insert participation answers

app.post("/submitpartanswers", authorization, async (req, res) => {
    try {
        const {partanswers} = req.body;
        const answer = partanswers[0];
        const part = await pool.query(
            "UPDATE salesforce.Participation_Answers__c SET selection__c = $1, selection_value__c = $2, Status__c = $3 WHERE Participation__c = $4 AND Question__c = $5 RETURNING *", [answer.selection__c, answer.selection_value__c, 'Submitted', answer.participation__c, answer.question__c]
            );
        //const question = await pool.query("SELECT * FROM salesforce.question__c WHERE sfid = $1", [answer.question__c])
        // if (question.rows[0].correct_answer__c !== answer.selection__c && question.rows[0].correct_answer__c !== null) {
        //     res.json(0) //incorrect
        //     console.log('incorrect');
        //     await pool.query("UPDATE salesforce.participation__c SET wrong_answers__c = wrong_answers__c+1 WHERE sfid = $1", [answer.participation__c])
        // } else {
        //     console.log('correct');
        //     res.json(1) //correct
        // }
        res.json(part.rows[0]);
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
pgListen.notifications.on("new_question", e => {
    console.log(e);
    if (e !== undefined && e.published__c && !e.islocked__c) {
        console.log('send socket question');
        io.to(e.contest__c).emit("new_question", e)
    }
    
})
pgListen.notifications.on("cor_question", e => {
    console.log(e);

        if(e.islocked__c && e.correct_answer__c !== undefined) {
            io.to(e.contest__c).emit("cor_question", e)
        }
})

pgListen.notifications.on("new_participation", e => {
    console.log('in new participation');
    console.log(e);

})

pgListen.events.on("error", (error) => {
    console.error("Fatal database connection error:", error)
    process.exit(1)
})
pgListen.connect()
pgListen.listenTo("new_question")

pgListen.listenTo("cor_question")

io.on("connection", (socket) => {
    socket.on("set_contest_room", e => {
        socket.join(e)
    })
});

http.listen(PORT, () => {
    console.log(`Server is starting on port ${PORT}`);
});
