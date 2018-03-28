const conversationModel = require('../models/conversationModel');
const userController = require('../controller/userController');
const userModel = require('../models/userModel');

let create = (data, cb) => {
    conversationModel.create(data, (err, res) => {
        if (err) throw err;
        cb(null, res);
    });
}

let getAll = (cb) => {
    conversationModel.find({}, (err, res) => {
        if (err) cb(err);
        cb(null, res);
    });
}

let getById = (id, cb) => {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        conversationModel.findById(id, (err, res) => {
            if (err) throw err;
            if (res) {
                cb(null, res);
            } else {
                cb(null, '404 not found');
            }
        });
    } else {
        cb(null, '404 not found');
    }
}

let update = (data, cb) => {
    conversationModel.findById(data._id, (err, res) => {
        if (err) cb(err);
        if (!res._id) cb(null, 'Not Found');
        for (let key in res) {
            if (data[key]) {
                res[key] = data[key];
            }
        }
        res.save((err, res1) => {
            if (err) cb(err);
            cb(null, res1);
        });
    });
}

let writePrivateMessage = (data, cb) => {
    conversationModel.findOne({
        sender: data.sender,
        receiver: data.receiver
    }, (err, res) => {
        if (err) cb(err);
        if (!res) {
            cb(null, 'Not Found');
            create(data, (err, resCreate) => {
                if (err) throw err;
                // console.log(`resCreate: ${resCreate}`)
                console.log(resCreate._id);
                userController.getByIdToAddMess({
                    id: data.sender,
                    conversationid: resCreate._id
                }, (err, resSender) => {
                    if (err) console.error(err);
                    if (resSender.conversationsNotFound === 'CONVERSATION NOT FOUND') {
                        resSender.res.Conversations.push(resCreate._id);
                        resSender.res.save((err, resSender1) => {
                            if (err) console.error(err);
                            cb(null, resSender1);
                        });

                        userController.getByIdToAddMess({
                            id: data.receiver,
                            conversationid: resCreate._id
                        }, (err, resReceiver) => {
                            if (err) console.error(err);
                            if (resReceiver.conversationsNotFound === 'CONVERSATION NOT FOUND') {
                                resReceiver.res.Conversations.push(resCreate._id);
                                resReceiver.res.save((err, resReceiver1) => {
                                    if (err) console.error(err);
                                    cb(null, resReceiver1);
                                });
                                return;
                            }
                        })
                        return;
                    }
                    console.log('Conversation da ton tai trong user: ' + resSender.res.username);

                });
            });
            return;
        }
        // for (let key in res) {
        //     if (data[key]) {
        //         res[key] = data[key];
        //     }
        // }
        if (data.messages) res.messages.push(data.messages);
        res.save((err, res1) => {
            if (err) cb(err);
            cb(null, res1);
        });
    });
}

let loadMessages = (data, cb) => {
    conversationModel.findOne({
        sender: data.sender,
        receiver: data.receiver
    }, (err, res) => {
        if (err) console.error(err);
        if (!res) {
            cb(null, 'NOT FOUND MESSAGE');
            return;
        }
        cb(null, {
            messages: res.messages
        });
    });
}

let loadConversations = (id, cb) => {
    userModel.findById(id, {
        username: 0,
        password: 0,
        created_at: 0,
        updated_at: 0
    }, (err, res) => {
        if (err) console.error(err);
        if (!res) {
            cb(null, 'NOT FOUND CONVERSATION');
            return;
        }

        for (let i = 0; i < res.Conversations.length; i++) {
            conversationModel.findOne({
                _id: res.Conversations[i]
            }, (erri, resConsversationi) => {
                if (erri) console.error(erri);
                if (!resConsversationi) {
                    console.log('resConsversationi has no value');
                    return;
                }
                if (res.Conversations.length - i > 1) {
                    for (let j = ++i; j < res.Conversations.length; j++) {
                        conversationModel.findOne({
                            _id: res.Conversations[j]
                        }, (errj, resConsversationj) => {
                            if (errj) console.error(errj);
                            if (!resConsversationj) {
                                console.log('resConsversationj has no value');
                                return;
                            } else if (resConsversationj.receiver.equals(resConsversationi.sender) && resConsversationj.sender.equals(resConsversationi.receiver)) {
                                const lastedMess = resConsversationi.messages[resConsversationi.messages.length - 1].date > resConsversationj.messages[resConsversationj.messages.length - 1].date ?
                                    resConsversationi.messages[resConsversationi.messages.length - 1] : resConsversationj.messages[resConsversationj.messages.length - 1]

                                if (res._id.equals(resConsversationi.sender)) {
                                    
                                    cb(null, {
                                        receiverId: resConsversationi.receiver,
                                        mess: lastedMess
                                    });
                                } else if (res._id.equals(resConsversationj.sender)) {
                                    
                                    cb(null, {
                                        receiverId: resConsversationj.receiver,
                                        mess: lastedMess
                                    });
                                }

                            }
                            return;
                        });
                    }
                    return;
                }

            });
        }
        // cb(null, res);
    });
}


module.exports = {
    create,
    getAll,
    getById,
    update,
    writePrivateMessage,
    loadMessages,
    loadConversations
}