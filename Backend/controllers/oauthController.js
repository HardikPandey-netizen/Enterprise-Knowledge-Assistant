const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const { oauth2client } = require("../utils/googleConfig");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRES_IN,
  });
};

exports.googleLogin = async (req, res, next) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ message: "Access token is required" });
  }
  try {
    const googleUser = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
    );

    const { email, name, picture } = googleUser.data;

    let user = await User.findOne({ email });
    if (user) {
      if (user.provider === "local") {
        user.provider = "google";
        user.profilePicture = picture || user.profilePicture;
        user.username = name || user.username;
        await user.save();
      }
    } else {
      user = await User.create({
        username: name,
        email,
        profilePicture: picture,
        provider: "google",
      });
    }

    const token = signToken(user.id);

    res.status(200).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Internal Server Error",
    });
  }
};
