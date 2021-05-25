const Pool = require("pg").Pool;
console.log('working from queries')
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
       rejectUnauthorized: false,
    },
 });

 const createSocketMessage = (message) => {
     console.log('socket message')
    return new Promise((resolve) => {
        pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true ORDER BY SubSegment__c ASC", [contest_id],
          [message.text, message.username],
          (error, results) => {
             if (error) {
                throw error;
             }else{
                 resolve(results.rows);

             }
           }
       );
    });
 };

// const getSocketQuestions = (req) => {
//     return new Promise((resolve) => {
//         const {contest_id}  = req.params;
//         pool.query("SELECT * FROM salesforce.question__c WHERE contest__c = $1 AND published__c = true ORDER BY SubSegment__c ASC", [contest_id],
//           (error, results) => {

//                 resolve(results.rows);

//            }
//        );
//     });
//   };

//   const getSocketParticipation = (req) => {
//     return new Promise((resolve) => {
//         const { partid} = req.body;
//         pool.query("SELECT * FROM salesforce.participation__c WHERE externalid__c = $1", [partid],
//           (error, results) => {
//              if (error) {
//                 console.log(error);
//              }else{
//                 resolve(results.rows);
//              }
//            }
//        );
//     });
//   };

//   const updateSocketAnswers = (contest_id) => {
//     return new Promise((resolve) => {
//         try {
//             const {partanswers} = req.body;
    
//             console.log(partanswers);
    
//             const cs = new pgp.helpers.ColumnSet(['?participation__c', '?question__c','selection__c', 'selection_value__c','status__c', 'externalid__c'], {table:{table: 'participation_answers__c', schema: 'salesforce'}});
            
//             const update = pgp.helpers.update(partanswers, cs) + ' WHERE v.Participation__c = t.participation__c AND v.Question__c = t.question__c RETURNING *';
    
//             // // executing the query:
//             await db.any(update)
//                 .then(data => {
//                     // OK, all records have been inserted
//                     console.log('data' + data);
//                     resolve(data);
//                 })
//                 .catch(error => {
//                     console.log('error');
//                     // Error, no records inserted
//                 });
    
//         }catch(err){
//             console.log('error on submit answer' + err);
//         }
//     });
  

  module.exports = {
    createSocketMessage
 };