const Pool = require("pg").Pool;

const pool = new Pool({
    user: "andrewirwin",
    password: "buster2k",
    host: "localhost",
    port: "5432",
    database: "localtree"

});


module.exports = pool;