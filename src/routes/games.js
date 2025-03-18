const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Game = require("../models/Game");

router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      searchTerm,
      category,
      minPrice,
      maxPrice = Infinity,
      sortBy,
    } = req.query ?? {};

    const filter = {};
    if (searchTerm) filter["$text"] = { $search: searchTerm };
    if (category) filter["category"] = { $in: category.split(",") };
    if (minPrice) {
      filter["price"] = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }

    const sort = sortBy
      ? {
          "popular": { reviewsCount: -1 }, // 인기순
          "title": { title: 1 }, // 이름 오름차순
          "price": { price: 1 }, // 가격 낮은 순
          "-price": { price: -1 }, // 가격 높은 순
          "discountPercentage": { discountPercentage: -1 }, // 할인 높은 순
          "releaseAt": { releaseAt: -1 }, // 최신 출시일 기준
        }[sortBy]
      : {};

    const limit = Number(size);
    const skip = (page - 1) * limit;
    const games = await Game.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    const totalCount = await Game.countDocuments(filter);
    const hasMore = page * limit < totalGames;

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

router.post("/", auth, async (req, res) => {
  try {
    await Game.Create(req.body);
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
