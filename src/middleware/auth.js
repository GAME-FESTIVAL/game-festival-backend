const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const authorization = req?.header("authorization");
  const token = authorization && authorization.split(" ")[1];
  if (!token) return res.sendStatus(401);
  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode.userId);
    if (!user) return res.status(400).send("없는 유저입니다.");
    req.user = user;
    next();
  } catch (err) {}
};

module.exports = auth;
