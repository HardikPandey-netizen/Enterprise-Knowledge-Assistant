const catchAsync = require("../utils/catchAsync");
const Query = require("../models/queryModel");


exports.createQuery = catchAsync(async (req, res, next) => {
  const { query, response, chat } = req.body;

  const doc = await Query.create({
    query,
    response,
    chat,
  });

  res.status(201).json({
    status: "success",
    data: {
      doc,
    },
  });
});


exports.getQueriesByChatId = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  const queries = await Query.find({ chat: chatId }).sort({ createdAt: 1 }); // oldest to newest

  res.status(200).json({
    status: "success",
    results: queries.length,
    data: {
      queries,
    },
  });
});


exports.deleteQuery = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const query = await Query.findByIdAndDelete(id);

  if (!query) {
    return res.status(404).json({
      status: "fail",
      message: "No query found with that ID",
    });
  }

  res.status(200).json({
    status: "success",
    message: "Query deleted",
  });
});
