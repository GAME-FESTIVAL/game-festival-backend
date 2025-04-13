const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Game = require("../models/Game");
const Comment = require("../models/Comment");

router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      searchTerm,
      categories,
      minPrice,
      maxPrice = Infinity,
      sortBy,
      releaseStatus = "released",
    } = req.query ?? {};

    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);

    const filter = {
      releaseAt: { $lte: baseDate },
    };

    if (searchTerm) filter["$text"] = { $search: searchTerm };
    if (categories) filter["categories"] = { $in: categories.split(",") };
    if (minPrice) {
      filter["price"] = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }
    if (releaseStatus === "upcoming") {
      baseDate.setDate(baseDate.getDate() + 1);
      filter["releaseAt"] = { $gte: baseDate };
    }

    const sort = sortBy
      ? {
          popular: { wishlistCount: -1 }, // 인기순
          title: { title: 1 }, // 이름 오름차순
          price: { price: 1 }, // 가격 낮은 순
          "-price": { price: -1 }, // 가격 높은 순
          discountPercentage: { discountPercentage: -1 }, // 할인 높은 순
          releaseAt: { releaseAt: -1 }, // 최신 출시일 기준
        }[sortBy]
      : { createdAt: -1 };

    const limit = Number(size);
    const skip = (page - 1) * limit;
    const games = await Game.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalCount = await Game.countDocuments(filter);
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ games, hasMore, totalCount });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const game = await Game.findById(req.params.id);
    return res.status(200).json(game);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  // auth,
  async (req, res, next) => {
    try {
      const lastGame = await Game.findOne().sort({ gameIndex: -1 });
      const gameIndex = lastGame?.gameIndex ? lastGame.gameIndex + 1 : 1;
      await Game.create({ ...req.body, gameIndex });
      return res.sendStatus(201).json();
    } catch (err) {
      next(err);
    }
  }
);

router.patch(
  "/:id",
  // auth,
  async (req, res, next) => {
    try {
      await Game.findByIdAndUpdate(req.params.id, req.body);
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  "/:id",
  // auth,
  async (req, res, next) => {
    try {
      // await Game.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
      await Game.deleteOne({ _id: req.params.id }); // 그냥 hard delete 시키기로
      return res.sendStatus(200);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
