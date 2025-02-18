const express = require("express");
const router = express.Router();
const {pool} = require("../db.js");

const authorization = require("../utils/authorize");

router.post("/profile", authorization, async (req, res) => {
    try {
        console.log('in profile');
        const participant = await pool.query("SELECT * FROM salesforce.participant__c WHERE ExternalId__c = $1", [req.user.id]);
        res.json(participant.rows[0]);
    } catch (err) {
        console.log('err profile::' + err);
    }
});

module.exports = router;