const conversationModel = require('../models/conversationModel');

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

let writePrivateMessage = (data , cb) => {
    conversationModel.findOne({
        sender: data.sender,
        receiver: data.receiver
    }, (err, res) => {
        if (err) cb(err);
        if (!res) {
            cb(null, 'Not Found');
            create(data, (err, resCreate)=>{
                if(err) throw err;
                console.log(`resCreate: ${resCreate}`)
            });
            return;
        }
        // for (let key in res) {
        //     if (data[key]) {
        //         res[key] = data[key];
        //     }
        // }
        if(data.messages) res.messages.push(data.messages);
        res.save((err, res1) => {
            if (err) cb(err);
            cb(null, res1);
        });
    });
}

let loadMessages = (data, cb) =>{
    conversationModel.findOne({
        sender: data.sender,
        receiver: data.receiver
    }, (err, res) =>{
        if(err) console.error(err);
        if(!res){
            cb(null, 'NOT FOUND MESSAGE');
            return;
        }
        cb(null,{
            messages: res.messages
        });
    });
}


module.exports = {
    create,
    getAll,
    getById,
    update,
    writePrivateMessage,
    loadMessages
}