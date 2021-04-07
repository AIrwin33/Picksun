const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(participant_id) {
    console.log('jwt generator' + participant_id);
    console.log('secret key ' + process.env.jwtSecret)
    const payload = {
        user: {
            id: participant_id
        }
    };

    return jwt.sign(payload, process.env.jwtSecret, {expiresIn: "3h"});
}

module.exports = jwtGenerator;