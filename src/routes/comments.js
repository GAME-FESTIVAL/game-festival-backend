const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");

router.get("/:userId", async (req, res, next) => {
  try {
    const writer = req.params.userId;
    const { page = 1, size = 5 } = req.query ?? {};
    const limit = Number(size);
    const skip = (page - 1) * limit;
    const games = await Comment.find({ writer }).skip(skip).limit(limit).lean();
    const totalCount = await Comment.countDocuments({ writer });
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ games, hasMore, totalCount });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { page = 1, size = 10, rating, playTime, sortBy } = req.query ?? {};

    const filter = {};

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
    const games = await Comment.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalCount = await Comment.countDocuments(filter);
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ games, hasMore, totalCount });
  } catch (err) {
    next(err);
  }
});

router.post("/", auth, async (req, res, next) => {
  try {
    await Comment.create(req.body);
    await User.findByIdAndUpdate(req.body.userId, {
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

router.delete("/:id", auth, async (req, res, next) => {
  try {
    await Comment.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
    await User.findByIdAndUpdate(req.body.userId, {
      $inc: { commentCount: -1 },
    });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
