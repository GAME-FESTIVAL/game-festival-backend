const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/auth", auth, async (req, res) => {
  return res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    iamge: req.user.image,
    cart: req.user.cart,
    orderHistory: req.user.orderHistory,
  });
});

router.post("/join", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Auth failed, email not found");
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) return res.status(400).send("Wrong password");
    const payload = {
      userId: user._id.toHexString(),
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ user, accessToken });
  } catch (err) {
    console.log(err);
  }
});

router.post("/logout", auth, (_, res, next) => {
  try {
    return res.sendStatus(200);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
