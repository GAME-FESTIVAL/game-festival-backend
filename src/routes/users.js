const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/wishlist", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  return res.status(200).json(user.cart);
});

router.get("/cart", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart");
  return res.status(200).json(user.cart);
});

router.post("/cart", auth, async (req, res, next) => {
  const { user, body } = req;
  try {
    const userInfo = await User.findOne({ _id: user._id });
    const isDuplicate = userInfo.cart.find(({ id }) => id === body.gameId);

    if (isDuplicate) {
      return res
        .status(409)
        .json({ message: "이미 장바구니에 있는 상품입니다." });
    } else {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $push: { cart: body.gameId } },
        { new: true }
      );
      return res.status(201).json(updatedUser.cart);
    }
  } catch (error) {
    next(error);
  }
});

router.delete("/cart", auth, async (req, res, next) => {
  const { user, query } = req;
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { cart: query.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.cart);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
