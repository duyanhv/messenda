const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const ConversationSchema = new mongoose.Schema({
//     users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Messages' }]
// }, {
//         timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
//     });

// mongoose.model('Conversatons', ConversationSchema);

const MessagesSchema = new mongoose.Schema({
    messages: String,
    sender: String,
    receiver: String,
    seen: Date
}, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    });

mongoose.model('Messages', MessagesSchema);

const Online = new mongoose.Schema({
    user_id: String,
    connection_id: String
});

mongoose.model('Online', Online);