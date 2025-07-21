const mongoose = require("mongoose");
const Chat = require("./chatHistoryModel");

const querySchema = new mongoose.Schema({
    query: {
        type: String,
        required: true,
    },
    response: {
        type: String,
        required: true,
    },
    chat: {
        type: mongoose.Schema.ObjectId,
        ref: 'Chat',
        required: [true,'A query must belong to a Chat']   
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Query = mongoose.model('Query',querySchema);
module.exports = Query;