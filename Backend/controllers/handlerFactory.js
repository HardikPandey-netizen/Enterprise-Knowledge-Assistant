const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newdoc = await Model.create(req.body);
    res.status(201).json({
      status: "sucess",
      data: {
        tour: newdoc,
      },
    }); //we have async writeFile because we do not want to block the event loop in the callback function
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const features = new APIFeatures(Model.find(), req.query)
      .search()
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    const totalDocs = await Model.countDocuments();
    res.status(200).json({
      status: "success",
      results: docs.length,
      total: totalDocs,
      data: {
        docs,
      },
    });
  });
