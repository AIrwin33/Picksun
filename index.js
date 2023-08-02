const express = require('express');
const app = express();
const http = require('http').createServer(app);
const setupSocketIO = require('./socket');
const ContestRoutes = require('./server/routes/contest.js')
const ParticipantsRoutes = require('./server/routes/participants.js')
const ProfileRoutes = require('./server/routes/profile.js')
const auth = require('./server/routes/auth.js')
const path = require('path');

// serve static files
app.use(express.static('public'));
// create a route
app.use('/contest',ContestRoutes)
app.use('/participants',ParticipantsRoutes)
app.use('/profile',ProfileRoutes)
app.use('/auth',auth)

if (process.env.NODE_ENV==="production") {
    // app.use(express.static('client/public'));
    app.use(express.static(path.join(__dirname, '/client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
        // res.sendFile(path.join(__dirname, 'client','index.html')) // relative path
    });
} else {
    app.get('/', (req, res) => {
        res.send('server is listening');
    });
}




// set up Socket.IO
setupSocketIO(http);

// start the server
const port = process.env.PORT || 5000;
http.listen(port, () => {
  console.log('listening on *:' + port);
});
