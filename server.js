const express = require('express');
const connectDB = require('./config/db');
const config = require('config');
const db = config.get('mongoURI');
const mongoose = require('mongoose');
const morgan = require('morgan');
//import routers
const usersRouter = require('./Routes/api/users');
const authRouter = require('./Routes/api/auth');
const postsRouter = require('./Routes/api/posts');
const profileRouter = require('./Routes/api/profile');

const { PORT } = require('./config');

//mongoose internally uses a "promise-like" object,
//but it's better to have Mongoose use built-in es6 promises.
mongoose.Promise = global.Promise;

const app = express();


// //connect Database
// connectDB();

//Init MIddleware
app.use(morgan('common'));
app.use(express.json());

//static file sharing
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

//Define Routes
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postsRouter);
app.use('/api/profile', profileRouter);
// catch-all endpoint if client makes request to non-existent endpoint
app.use("*", function (req, res) {
    res.status(404).json({ message: "Not Found" });
});

let server;

const mongooseConnectOptions = {
    useNewUrlParser: true, //makes the deprecated warnings go away
    useUnifiedTopology: true, //makes the deprecated warnings go away
    useCreateIndex: true, //makes deprecation error go away
    useFindAndModify: false //makes deprecation error go away for model.findOneAndUpdate()
};

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, mongooseConnectOptions, err => {
            if (err) {
                return reject(err);
            }
            server = app
                .listen(port, () => {
                    console.log(`Your app is listening on port ${port}`);
                    resolve(server);
                })
                .on('error', err => {
                    console.log(`Something went arry, here's the error: ${err}`)
                    mongoose.disconnect();
                    reject(err);
                });
        })//end of mongoose.connect()
    });// end of new Promise
};//end of runServer()


function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('CLOSING SERVER');
            server.close(err => {
                if (err) {
                    console.log('Error with closing the server, here is the error:', err);
                    reject(err);
                    return;
                };
                resolve(); //if no err, resolve
            });
        });//end of new Promise
    })//end of .then()
};//end of closeServer()

//will only run by itslef runServer() if it's being called normally. but NOT if it's being called from a test.
if (require.main === module) {
    runServer(db)
        .catch(err => console.error(err));
}


module.exports = { app, runServer, closeServer };