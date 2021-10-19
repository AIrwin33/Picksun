const Pool = require("pg").Pool;
console.log('working from db')
const devConfig = new Pool({
  HOST: "localhost",
  // USER: "andrewirwin",
  // PASSWORD: "buster2k",
  USER: "postgres",
  PASSWORD: "",
  DB: "localtree",
  dialect: "postgres"
});

const proConfig = process.env.DATABASE_URL; //heroku addons
const pool = new Pool({
  client: 'postgresql',
  connectionString:
    process.env.NODE_ENV === "production" ? proConfig : devConfig,
    ssl: { rejectUnauthorized: false }
});

const createSubscriber = require("pg-listen")
const pgListen = createSubscriber({ connectionString: proConfig})



module.exports = {pool, pgListen};
