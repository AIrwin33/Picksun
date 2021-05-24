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
  client: 'postgresql',
  connectionString:
    process.env.NODE_ENV === "production" ? proConfig : devConfig,
    ssl: { rejectUnauthorized: false }
});

const getSocketQuestions = (contest_id) => {
    return new Promise((resolve) => {
        pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true ORDER BY SubSegment__c ASC", [contest_id],
          (error, results) => {
             if (error) {
                throw error;
             }
             resolve(results.rows);
           }
       );
    });
  };

  const getSocketParticipation = (partid) => {
    return new Promise((resolve) => {
        pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [partid],
          (error, results) => {
             if (error) {
                throw error;
             }
             resolve(results.rows);
           }
       );
    });
  };

  const updateSocketAnswers = (contest_id) => {
    return new Promise((resolve) => {
        try {
            const {partanswers} = req.body;
    
            console.log(partanswers);
    
            const cs = new pgp.helpers.ColumnSet(['?participation__c', '?question__c','selection__c', 'selection_value__c','status__c', 'externalid__c'], {table:{table: 'participation_answers__c', schema: 'salesforce'}});
            
            const update = pgp.helpers.update(partanswers, cs) + ' WHERE v.Participation__c = t.participation__c AND v.Question__c = t.question__c RETURNING *';
    
            // // executing the query:
            await db.any(update)
                .then(data => {
                    // OK, all records have been inserted
                    console.log('data' + data);
                    resolve(data);
                })
                .catch(error => {
                    console.log('error');
                    // Error, no records inserted
                });
    
        }catch(err){
            console.log('error on submit answer' + err);
        }
    });
  };

  module.exports = {
    getSocketQuestions,
    getSocketParticipation,
    updateSocketAnswers,

 };