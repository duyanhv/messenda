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
var sessionStore = new expressSession.MemoryStore();
const session = expressSession({
    name: 'cookiename',
    store: sessionStore,
    secret: 'duyanhv',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: null }
});

app.use(session);
var socket = require('./controller/socket')(http);
const userRouter = require('./routes/userRouter')(socket, app, sessionStore);

app.use('/', userRouter);

app.use(express.static('public'));

app.get('/*', (req, res) =>{
    res.render('404notfound');
});
mongoose.connect(config.connectionString || process.env.MONGODB_URI, (err) => {
    if (err) {
        console.log("err mongoose")
        console.log(err);
    } else {
        console.log("Connect Successfully");
    }
});

http.listen(config.port || process.env.PORT, (err) => {
    if (err) {
        console.log("err http")
        console.log(err);
    } else {
        console.log(`Connected on port ${config.port}`);
    }
});