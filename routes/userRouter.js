const express = require('express');
const Router = express.Router();
const cookie = require('cookie');
const cookieParser = require('cookie-parser');

const userController = require('../controller/userController');
const isAuthen = userController.isAuthen;

const init = (io, app, sessionStore) => {

    Router.get('/', (req, res) => {
        res.redirect('/login');
    });

    Router.get('/login', (req, res) => {
        res.render('login');
    });

    Router.get('/checkSession', (req, res) => res.send(req.session.user.user._id));

    var userid = "";
    var currentUsername = "";

    Router.post('/api/login', (req, res) => {
        userController.authen(req.body.username, req.body.password, (err, data) => {
            if (err) console.error(err);
            if (data) {
                if (data.isMatch) {
                    req.session.regenerate(() => {
                        userid = data.user._id;
                        currentUsername = data.user.username;
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
    var users = {};
    
    Router.get('/api/chat/:id', (req, res) => {
        var searchUserId ='';
        searchUserId = req.params.id;
        users[req.session.user.user._id] = searchUserId;
        res.render('index', {
            userId: req.params.id
        });
    });

    Router.post('/api/chat/:id', (req, res) => {

    });

    var clients = {};

    io.use(function (socket, next) {
        if (socket.request.headers.cookie) {
            socket.request.cookie = cookie.parse(cookieParser.signedCookie(socket.request.headers.cookie, 'secret'));

            // console.log('cookie header ( %s )', JSON.stringify(socket.request.headers.cookie));
            var cookies = cookie.parse(socket.request.headers.cookie);
            // console.log('cookies parsed ( %s )', JSON.stringify(cookies));
            if (!cookies['cookiename']) {
                return next(new Error('Missing cookie ' + 'cookiename'));
            }
            var sid = cookieParser.signedCookie(cookies['cookiename'], 'duyanhv');
            if (!sid) {
                return next(new Error('Cookie signature is not valid'));
            }
            // console.log('session ID ( %s )', sid);
            socket.request.sid = sid;
            sessionStore.get(sid, function (err, session) {
                if (err) return next(err);
                if (!session) return next(new Error('session not found'));
                socket.request.session = session;
                next();
            });
        }
        else next();
    });

    io.on('connection', (socket) => {
        // console.log('session user:');
        //lay du lieu user tu session
        // console.log(socket.request.session);
        if(typeof socket.request.session.user.user.username !== 'undefined'){
            socket.emit('username', socket.request.session.user.user.username);
        }

        socket.on('url', (data) => {
            if (data) {
                if (typeof socket.request.session.user.user._id !== 'undefined') {
                    clients[socket.request.session.user.user._id] = socket.id;
                }

                // console.log(`api/chat: ${socket.id}`);
            }
        });
        socket.on('send message', (data) => {

            if (typeof socket.request.session !== 'undefined' &&
                typeof users !== 'undefined') {
                io.sockets.connected[clients[users[socket.request.session.user.user._id]]].emit('private chat', {
                    user: socket.request.session.user.user.username,
                    message: data.message
                });
                io.sockets.connected[socket.id].emit('private chat', {
                    user: socket.request.session.user.user.username,
                    message: data.message
                });

            }
        });

        socket.on('typing', (typing) => {
            socket.broadcast.emit('typing', typing);
        });

        socket.on('disconnect', ()=>{
            delete clients[socket.request.session.user.user._id];
        });
    });


    return Router;
}



module.exports = init;

