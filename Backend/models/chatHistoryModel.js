const mongoose = require("mongoose");
const User = require('./userModel');

const messageSchema = new mongoose.Schema({
  query: String,
  response: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        length: [8,20]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'A chat must belong to a user']   
    },
    messages: [messageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('Chat',chatSchema);
module.exports = Chat;