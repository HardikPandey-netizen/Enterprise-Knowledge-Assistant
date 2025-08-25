const catchAsync = require("../utils/catchAsync");
const Chat = require("../models/chatHistoryModel");
const AppError = require("../utils/appError");
const APIFeatures = require('./../utils/apiFeatures');
const { findByIdAndUpdate } = require("../models/queryModel");


exports.createChat = catchAsync(async (req, res, next) => {
  try{
    const { userId } = req.params;
  const { name } = req.body;

  

  let finalName = name;

  if(!finalName){
    const count = await Chat.countDocuments({ user: userId });  
    finalName = `Chat#${count+1}`;
  }

  const doc = await Chat.create({
    name: finalName,
    user: userId,
  });

  res.status(201).json({
    status: "success",
    data: {
      doc,
    },
  });
  }catch(err){
    console.log(err);
  }
});


exports.updateChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { name } = req.body;

  const doc = await Chat.findByIdAndUpdate(chatId, { name }, { new: true });

  if (!doc) {
    next(new AppError('Doc not found',404));
  }

  res.status(200).json({
    status: "success",
    data: {
      doc,
    },
  });
});


exports.deleteChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const doc = await Chat.findByIdAndDelete(chatId);

  if (!doc) {
    next(new AppError('Doc not found',404));
  }

  res.status(200).json({
    status: "success",
    message: "Chat successfully deleted",
  });
});

exports.getUserChats = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Find all chats for this user, newest first
  const docs = await Chat.find({ user: userId }).sort("-createdAt");
  const totalDocs = docs.length;

  res.status(200).json({
    status: "success",
    results: totalDocs,
    data: {
      docs,
    },
  });
});



exports.createQuery = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { query, response } = req.body;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  const newMessage = {
    query,
    response,
    createdAt: new Date()
  };

  chat.messages.push(newMessage);
  await chat.save();

  // Return only the new message
  res.status(201).json({
    status: "success",
    data: {
      message: newMessage
    }
  });
});

exports.getQueries = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError("Chat not found", 404));
  }

  res.status(200).json({
    status: "success",
    results: chat.messages.length,
    data: {
      messages: chat.messages,
    },
  });
});
 