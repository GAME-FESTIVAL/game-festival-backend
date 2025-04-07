const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { createNewCommenter } = require("../middleware/comments");
const Comment = require("../models/Comment");
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

router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      gameId,
      rating,
      playTime,
      sortBy,
    } = req.query ?? {};

    const filter = { gameId };
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
      .populate("writer", "_id nickname")
      .lean();
    const totalCount = await Comment.countDocuments(filter);
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ comments, hasMore, totalCount });
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const writer = req.user._id;
    await Comment.create({ ...req.body, writer });
    await User.findByIdAndUpdate(writer, {
      $inc: { commentCount: 1 },
    });
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

router.post("/dummy", createNewCommenter, async (req, res, next) => {
  try {
    const writer = req.dummyCommenter._id;
    await Comment.create({ ...req.body, writer });
    await User.findByIdAndUpdate(writer, {
      $inc: { commentCount: 1 },
    });
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", auth, async (req, res, next) => {
  try {
    await Comment.findByIdAndUpdate(req.params.id, req.body);
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
      // await Comment.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      await Comment.deleteOne({ _id: req.params.id }); // 그냥 hard delete 시키기로
      await User.findByIdAndUpdate(req.body.userId, {
        $inc: { commentCount: -1 },
      });
      res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
