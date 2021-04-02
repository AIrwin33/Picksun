const Pool = require("pg").Pool;

const devConfig = new Pool({
    user: "andrewirwin",
    password: "buster2k",
    host: "localhost",
    port: "5432",
    database: "localtree"

});

const proConfig = process.env.DATABASE_URL; //heroku addons

const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === "production" ? proConfig : devConfig,
    ssl: { rejectUnauthorized: false }
});

module.exports = pool;
