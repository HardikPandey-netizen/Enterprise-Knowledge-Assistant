const express = require("express");
const morgan = require("morgan");
const app = express();
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const cors = require("cors");
const chatRouter = require("./routes/chatRoutes");

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/chats", chatRouter);

app.get("/", () => {
  res.send("I am Live");
});

app.all("*", (req, res, next) => {
  next(new AppError(`cannot find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
