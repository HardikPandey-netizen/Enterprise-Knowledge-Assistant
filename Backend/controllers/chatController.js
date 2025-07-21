const catchAsync = require("../utils/catchAsync");
const Chat = require("../models/chatHistoryModel");
const AppError = require("../utils/appError");
const APIFeatures = require('./../utils/apiFeatures');


exports.createChat = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { name } = req.body;

  let finalName = name;

  if(!finalName){
    const count = await Chat.countDocuments({userId});
    finalName = `Chat#${count+1}`;
  }

  const doc = await Chat.create({
    name: finalName,
    userId,
  });

  res.status(201).json({
    status: "success",
    data: {
      doc,
    },
  });
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

  
  const filter = { user: userId };

  const features = new APIFeatures(Chat.find(filter), req.query)
    .search()
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query;
  const totalDocs = await Chat.countDocuments(filter);

  res.status(200).json({
    status: "success",
    results: docs.length,
    total: totalDocs,
    data: {
      docs,
    },
  });
});

