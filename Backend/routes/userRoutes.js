const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const oauthController = require('./../controllers/oauthController');
const passport = require("passport");

router.post("/signup",authController.signup);
router.post("/login",authController.login);
router.post("/forgotPassword",authController.forgotPassword);
router.patch("/resetPassword/:token",authController.resetPassword);

router.post("/oauth/google", oauthController.googleLogin);


router
  .route("/")
  .get(authController.protect,userController.getUsers)
  .post(userController.createUser); 

module.exports = router;  