const express = require('express');
const handlebars = require('express-handlebars');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const config = require('./config');
let app = express();
const Router = express.Router();

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

let http = require('http').Server(app);
var socket = require('./controller/socket')(http);
const userRouter = require('./routes/userRouter')(socket);

app.use(session({
    secret: 'duyanhv',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));

app.use('/', userRouter);
// app.get('/', (req, res) => {
//     res.render('index');

// });




// app.use((req, res, next) =>{
//     req.io = io;
//     next();
// });


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