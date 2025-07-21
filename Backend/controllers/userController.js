const User = require("./../models/userModel");
const factory = require("./handlerFactory");

exports.createUser = (req,res)=>{
    res.status(500).json({
        status: "error",
        message: "This route is not yet defined!Use signup instead"
    })
}
exports.getUsers = factory.getAll(User);
