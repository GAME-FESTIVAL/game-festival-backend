const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Game = require("../models/Game");
const Comment = require("../models/Comment");
const throwError = require("../utils/throwError");

router.get("/info", auth, async (req, res) => {
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

router.patch("/info", auth, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body);
    return res.status(200).json(user.wishlist);
  } catch (err) {
    next(err);
  }
});

router.get("/wishlist", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    return res.status(200).json(user.wishlist);
  } catch (err) {
    next(err);
  }
});

router.post("/wishlist", auth, async (req, res, next) => {
  const { user, body } = req;
  const isDuplicate = req.user.wishlist.find((id) => id === body.gameId);

  if (isDuplicate) {
    return next(throwError(409, "이미 위시리스트에 있는 상품입니다."));
  }

  try {
    await Game.findByIdAndUpdate(body.gameId, { $inc: { wishlistCount: 1 } });
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { wishlist: body.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.wishlist);
  } catch (err) {
    next(err);
  }
});

router.delete("/wishlist", auth, async (req, res, next) => {
  const { user, query } = req;
  try {
    await Game.findByIdAndUpdate(body.gameId, { $inc: { wishlistCount: -1 } });
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $pull: { wishlist: query.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.wishlist);
  } catch (err) {
    next(err);
  }
});

router.get("/cart", auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart");
    return res.status(200).json(user.cart);
  } catch (err) {
    next(err);
  }
});

router.post("/cart", auth, async (req, res, next) => {
  const { user, body } = req;
  const isDuplicate = req.user.cart.find((id) => id === body.gameId);

  if (isDuplicate) {
    return next(throwError(409, "이미 장바구니에 있는 상품입니다."));
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
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
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $pull: { cart: query.gameId } },
      { new: true }
    );
    return res.status(201).json(updatedUser.cart);
  } catch (err) {
    next(err);
  }
});

router.post("/vote-comment", auth, async (req, res, next) => {
  try {
    const { commentId, voteType } = req.body;

    if (!["helpful", "notHelpful"].includes(voteType)) {
      return next(
        throwError(400, "helpful, notHelpful 중 하나를 선택해주세요.")
      );
    }

    const oppositeVote = voteType === "helpful" ? "notHelpful" : "helpful";
    let updateField = { $inc: { [voteType]: 1 } };

    const user = await User.findById(req.user.id);

    const votedComment = user.votedComments.find(
      ({ el }) => el.commentId === commentId
    );

    if (votedComment) {
      const isDuplicate = votedComment.voteType === voteType;
      updateField = {
        $inc: {
          [voteType]: isDuplicate ? -1 : 1,
          [oppositeVote]: isDuplicate ? 0 : 1,
        },
      };
    }

    const updateVotedComments = [
      { commentId: commentId, voteType },
      ...user.votedComments.filter((el) => el.commentId !== commentId),
    ];

    await Comment.findByIdAndUpdate(commentId, updateField);
    await User.findByIdAndUpdate(req.user.id, {
      votedComments: updateVotedComments,
    });

    res.status(200).json(updateVotedComments);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
