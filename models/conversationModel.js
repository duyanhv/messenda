const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConversationSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId },
    receiver: { type: mongoose.Schema.Types.ObjectId },
    messages:
        [{
            username: {type: String},
            message: {type: String},
            seen: { type: Boolean, default: false },
            date: {type:Date}
        }]
});

var conversationModel = mongoose.model('Conversations', ConversationSchema);
module.exports = conversationModel;