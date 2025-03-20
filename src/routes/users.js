const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Game = require("../models/Game");

router.get("/wishlist", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");
  return res.status(200).json(user.wishlist);
});

router.post("/wishlist", auth, async (req, res, next) => {
  const { user, body } = req;
  const isDuplicate = req.user.wishlist.find((id) => id === body.gameId);

  if (isDuplicate) {
    return res
      .status(409)
      .json({ message: "이미 위시리스트에 있는 상품입니다." });
  }

  try {
    await Game.findOneAndUpdate(
      { _id: body.gameId },
      { $inc: { wishlistCount: 1 } }
    );
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { wishlist: body.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.wishlist);
  } catch (error) {
    next(error);
  }
});

router.delete("/wishlist", auth, async (req, res, next) => {
  const { user, query } = req;
  try {
    await Game.findOneAndUpdate(
      { _id: body.gameId },
      { $inc: { wishlistCount: -1 } }
    );
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $pull: { wishlist: query.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.wishlist);
  } catch (error) {
    next(error);
  }
});

router.get("/cart", auth, async (req, res) => {
  const user = await User.findById(req.user._id).populate("cart");
  return res.status(200).json(user.cart);
});

router.post("/cart", auth, async (req, res, next) => {
  const { user, body } = req;
  const isDuplicate = req.user.cart.find((id) => id === body.gameId);

  if (isDuplicate) {
    return res
      .status(409)
      .json({ message: "이미 장바구니에 있는 상품입니다." });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $push: { cart: body.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.cart);
  } catch (err) {
    next(err);
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
