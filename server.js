const express = require('express');
const handlebars = require('express-handlebars');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const expressSession = require('express-session');

const config = require('./config');
let app = express();
const Router = express.Router();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

let http = require('http').Server(app);
var socket = require('./controller/socket')(http);
const session = expressSession({
    secret: 'duyanhv',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
});

app.use(session);

const userRouter = require('./routes/userRouter')(socket, app, session);

app.use('/', userRouter);

app.use(express.static('public'));

mongoose.connect(config.connectionString, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Connect Successfully");
    }
});

http.listen(config.port, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Connected on port ${config.port}`);
    }
});