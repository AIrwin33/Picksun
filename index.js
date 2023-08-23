const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const setupSocketIO = require('./socket');
const authorization = require("./server/utils/authorize");
const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
  });

const path = require('path');
app.set('port', (process.env.PORT || 5000));
app.use(cors());
app.use(express.json());
app.use(session);
// serve static files
app.use(express.static('public'));
// create a route
router.use("/auth",require('./server/routes/jwtAuth'));
router.use("/profile", require('./server/routes/profile'));
router.use("/contest", require('./server/routes/contest'));
router.use("/parts", require('./server/routes/participants'));

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
