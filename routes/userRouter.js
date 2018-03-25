const express = require('express');
const Router = express.Router();
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const util = require('util');

const userController = require('../controller/userController');
const conversationController = require('../controller/conversationController');
const isAuthen = userController.isAuthen;

const init = (io, app, sessionStore) => {

    Router.get('/', (req, res) => {
        if(typeof req.session !== 'undefined'){
            res.redirect('/api/chat/');
        }else{
            res.redirect('/login');
        }
    });

    Router.get('/login', (req, res) => {
        res.render('login');
    });
    // .user.user._id
    Router.get('/checkSession', (req, res) => res.send(req.session));

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

    Router.get('/logout', isAuthen, (req, res) => {
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

    Router.get('/api/chat/', isAuthen, (req, res) => {
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

    Router.post('/api/chat/', isAuthen, (req, res) => {
        userController.findByUsername(req.body.search, (err, data) => {
            if (err) console.error(err);
            
            res.json(data);
        });
    });

    var users = {};
    Router.get('/api/chat/:id', isAuthen, (req, res) => {
        var conversation = [];
        var sortedConversation = [];
        var searchUserId = '';
        searchUserId = req.params.id;
        users[req.session.user.user._id] = searchUserId;

        conversationController.loadMessages({
            sender: req.session.user.user._id,
            receiver: req.params.id
        }, (err, dataSender) => {
            if (err) console.error(err);

            // if(typeof dataSender.messages == 'undefined'){
            //     console.log('NOT FOUND MESSAGE');
            //     res.render('index', {
            //         userId: req.params.id,
            //         conversation: conversation
            //     });

            //     return;
            // }
            var dataSender_messages_length = !(typeof dataSender.messages === 'undefined') ? dataSender.messages.length : 0;

            for (let i = 0; i < dataSender_messages_length; i++) {
                conversation.push(dataSender.messages[i]);
            }

            conversationController.loadMessages({
                sender: req.params.id,
                receiver: req.session.user.user._id
            }, (err, dataReceiver) => {
                if (err) console.log(err);

                var dataReceiver_messages_length = !(typeof dataReceiver.messages === 'undefined') ? dataReceiver.messages.length : 0;
                for (let j = 0; j < dataReceiver_messages_length; j++) {
                    conversation.push(dataReceiver.messages[j]);
                }

                conversation.sort(function (a, b) {
                    var dateA = new Date(a.date);
                    var dateB = new Date(b.date);
                    return dateA - dateB;
                });
                // console.log('====================');
                // console.log(util.inspect(conversation, false, null));
                // console.log('====================');


                // console.log(`dataMessage1: ${util.inspect(dataSender, false, null)}`);
                // console.log(`dataMessage2: ${util.inspect(dataReceiver, false, null)}`);

                console.log(conversation);
                res.render('index', {
                    userId: req.params.id,
                    conversation: conversation
                });

            });
        });
    });

    Router.post('/api/chat/:id', isAuthen, (req, res) => {
        // conversationController.create({
        //     "sender": req.session.user.user._id,
        //     "receiver": mongoose.Types.ObjectId(req.body.receiver),
        //     "messages": req.body.message
        // }, (err, res) =>{
        //     if(err) throw err;
        //     res.send('nice');
        // });
    });

    Router.put('/api/chat/:id', isAuthen, (req, res) => {

    });

    var clients = {};
    var usersOnline = {};

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

        if (typeof socket.request.session.user.user.username !== 'undefined') {
            socket.emit('username', socket.request.session.user.user.username);
        }

        socket.on('url', (data) => {
            if (data) {
                if (typeof socket.request.session.user.user._id !== 'undefined') {
                    clients[socket.request.session.user.user._id] = socket.id;

                    usersOnline[socket.request.session.user.user.username] = socket.id;
                    io.sockets.emit('usersOnline', usersOnline);

                }

                // console.log(`api/chat: ${socket.id}`);
            }
        });

        // console.log(`clients[users[socket.request.session.user.user._id]]: ${clients[users[socket.request.session.user.user._id]]}`);
        socket.on('send message', (data) => {

            if (typeof socket.request.session !== 'undefined' &&
                typeof users !== 'undefined') {

                if (!(typeof clients[users[socket.request.session.user.user._id]] === 'undefined')) {
                    io.sockets.connected[clients[users[socket.request.session.user.user._id]]].emit('private chat', {
                        user: socket.request.session.user.user.username,
                        message: data.message,
                        receiver: data.receiver_id,
                        userid: socket.request.session.user.user._id
                    });
                    io.sockets.connected[socket.id].emit('private chat', {
                        user: socket.request.session.user.user.username,
                        message: data.message
                    });
                }else{
                    io.sockets.connected[socket.id].emit('private chat', {
                        user: socket.request.session.user.user.username,
                        message: data.message,
                        receiver: data.receiver_id,
                        userid: socket.request.session.user.user._id
                    });
                }
            }
        });

        socket.on('saveMess', (saveMess) => {
            // console.log(saveMess.userid);
            // console.log(typeof socket.request.session.user.user._id.toString());
            // console.log(`saveMess.username: ${saveMess.username}`);
            // console.log(`socket: ${socket.request.session.user.user.username}`);
            // (saveMess.username === socket.request.session.user.user.username) && 
            // console.log(saveMess.userid == socket.request.session.user.user._id.toString());
            // console.log(socket.request.session.user.user._id);
            if (typeof saveMess.message != 'undefined') {
                console.log(saveMess);
                conversationController.writePrivateMessage({
                    sender: saveMess.userid,
                    receiver: saveMess.receiver,
                    messages: {
                        username: saveMess.username,
                        message: saveMess.message,
                        date: new Date()
                    }
                }, (err, res) => {
                    if (err) throw err;
                    console.log(res);
                });
            }
        });

        socket.on('typing', (typing) => {
            if (typeof socket.request.session !== 'undefined' &&
                typeof users !== 'undefined' && typeof clients[users[socket.request.session.user.user._id]] !== 'undefined') {
                io.sockets.connected[clients[users[socket.request.session.user.user._id]]].emit('typing', typing);
            };

        });

        // socket.on('stoptyping', (typing) =>{
        //     if (typeof socket.request.session !== 'undefined' &&
        //     typeof users !== 'undefined') {
        //         io.sockets.connected[clients[users[socket.request.session.user.user._id]]].emit('stoptyping', typing);
        //     };
        // });

        socket.on('disconnect', () => {
            delete clients[socket.request.session.user.user._id];
            delete usersOnline[socket.request.session.user.user.username];
            io.sockets.emit('usersOnline', usersOnline);
        });
    });



    return Router;
}



module.exports = init;

