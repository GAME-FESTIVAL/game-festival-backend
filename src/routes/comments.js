const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createNewCommenter,
  checkAlreadyCommented,
} = require("../middleware/comments");
const Comment = require("../models/Comment");
const Game = require("../models/Game");
const User = require("../models/User");

router.get("/:userId", async (req, res, next) => {
  try {
    const { page = 1, size = 5 } = req.query ?? {};
    const limit = Number(size);
    const skip = (page - 1) * limit;
    const comments = await Comment.find({ writer: req.params.userId })
      .skip(skip)
      .limit(limit)
      .lean();
    const totalCount = await Comment.countDocuments();
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ comments, hasMore, totalCount });
  } catch (err) {
    next(err);
  }
});

router.get("/:gameId", async (req, res, next) => {
  try {
    const { page = 1, size = 10, rating, playTime, sortBy } = req.query ?? {};

    const filter = { gameId: req.params.gameId };
    if (playTime) filter["playTime"] = playTime;
    if (rating) filter["rating"] = rating;

    const sort = sortBy
      ? {
          helpful: { helpful: -1 }, // 도움순
          likes: { likes: -1 }, // 좋아요순
        }[sortBy]
      : { createdAt: -1 };

    const limit = Number(size);
    const skip = (page - 1) * limit;
    const comments = await Comment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("writer", "_id nickname commentCount")
      .lean();
    const totalCount = await Comment.countDocuments(filter);
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ comments, hasMore, totalCount });
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, checkAlreadyCommented, async (req, res, next) => {
  try {
    const writer = req.user._id;
    const comment = await Comment.create({ ...req.body, writer });
    await User.findByIdAndUpdate(writer, {
      $inc: { commentCount: 1 },
    });
    await Game.findByIdAndUpdate(comment.gameId, {
      $inc: { totalRating: comment.rating, totalRater: 1 },
    });
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/dummy",
  createNewCommenter,
  checkAlreadyCommented,
  async (req, res, next) => {
    try {
      const writer = req.dummyCommenter._id;
      const comment = await Comment.create({ ...req.body, writer });
      await User.findByIdAndUpdate(writer, {
        $inc: { commentCount: 1 },
      });
      await Game.findByIdAndUpdate(comment.gameId, {
        $inc: { totalRating: comment.rating, totalRater: 1 },
      });
      return res.sendStatus(201);
    } catch (err) {
      next(err);
    }
  }
);

router.patch("/:id", auth, async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body);
    await Game.findByIdAndUpdate(comment.gameId, {
      $inc: { totalRating: req.body.reting - comment.rating },
    });
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:id",
  // auth,
  async (req, res, next) => {
    try {
      const writer = req?.userId || req.params?.writer;
      // await Comment.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      const comment = await Comment.findOneAndDelete(req.params.id); // 그냥 hard delete 시키기로
      await User.findByIdAndUpdate(writer, {
        $inc: { commentCount: -1 },
      });
      await Game.findByIdAndUpdate(comment.gameId, {
        $inc: { totalRating: -comment.rating, totalRater: -1 },
      });
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
