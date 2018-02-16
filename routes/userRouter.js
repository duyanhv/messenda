const express = require('express');
const Router = express.Router();

const userController = require('../controller/userController');
const isAuthen = userController.isAuthen;

let app = express();

const init = (io) => {

    Router.get('/', (req, res) => {
        res.redirect('/login');
    });

    Router.get('/login', (req, res) => {
        res.render('login');
    });
    var userid = "";
    Router.post('/api/login', (req, res) => {
        userController.authen(req.body.username, req.body.password, (err, data) => {
            if (err) console.error(err);
            if (data) {
                if (data.isMatch) {
                    req.session.regenerate(() => {
                        userid = data.user._id;
                        req.session.user = data;
                        res.send(data.user._id);
                    });
                } else {
                    req.session.error = 'Authen failed'
                    res.redirect('/login');
                }
            } else {
                console.log('failed');
            }
        });
    });



    Router.get('/api/user/:id', isAuthen, (req, res) => {
        userController.getById(req.params.id, (err, data) => {
            if (err) console.error(err);
            res.json(data);
        });
    });

    Router.get('/logout', (req, res) => {
        req.session.destroy(() => {
            res.send('destroyed');
        });
    });

    Router.get('/api/user', isAuthen, (req, res) => {
        userController.getAll((err, data) => {
            if (err) console.error(err);
            if (data) {
                res.send(data);
            }
        });
    });

    Router.post('/api/createuser', (req, res) => {
        userController.create(req.body, (err, data) => {
            if (err) console.error(err);
            if (data) {
                res.send(data);
            }
        });
    });

    Router.get('/api/chat/', (req, res) => {
        res.render('index');
        // io.on('connection', (socket) => {
        //     socket.on('chat', (msg) => {
        //         io.emit('chat', msg);
        //         console.log(msg);
        //     });
        //     // console.log(socket.id);

        //     // socket.on('typing', (typing) =>{
        //     //     socket.broadcast.emit('typing', typing);
        //     // });
        //     //     socket.join('5a7f9fd7e78b490926a13cd5/5a7fa399baea0b09e85fd3ae');
        //     //     socket.on('chat', (msg) =>{
        //     //         socket.boardcast.to('5a7f9fd7e78b490926a13cd5/5a7fa399baea0b09e85fd3ae').emit('chat', msg);
        //     //     })
        // });

    });

    Router.post('/api/chat/', (req, res) => {
        userController.findByUsername(req.body.search, (err, data) => {
            if (err) console.error(err);
            res.json(data);
        });
    });
    io.on('connection', (socket) => {

        socket.on('url', (data) => {
            if (data == '/api/chat') {
                if(typeof userid !== 'undefined'){
                    socket.id = userid;
                }
                console.log(`api/chat: ${socket.id}`);

            }
        });


    });

    return Router;
}



module.exports = init;

