const Pool = require("pg").Pool;
console.log('working from db')
const devConfig = new Pool({
  HOST: "localhost",
  USER: "andrewirwin",
  PASSWORD: "buster2k",
  DB: "localtree",
  dialect: "postgres"
});

const proConfig = process.env.DATABASE_URL; //heroku addons

const pool = new Pool({
  connectionString:
    process.env.NODE_ENV === "production" ? proConfig : devConfig,
    ssl: true
});


module.exports = pool;
