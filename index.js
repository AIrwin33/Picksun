const express = require('express');
const router = express.Router();
const app = express();
const cors = require('cors');
const http = require('http').createServer(app);
const setupSocketIO = require('./socket');
const authorization = require("./server/utils/authorize");

const path = require('path');
app.use(cors());
// serve static files
app.use(express.static('public'));
// create a route
app.use("/auth",require('./server/routes/jwtAuth'));
app.use("/profile", require('./server/routes/profile'))
// app.use(require('./server/routes/contest'))
// app.use(require('./server/routes/participants'))

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
