const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { validateGameFields } = require("../middleware/game");
const Game = require("../models/Game");

//메인
// /games?sortBy=popular&page=1&size=10 인기 신규 게임
// /games?releaseStatus=recent&sortBy=popular&page=1&size=10 인기 신규 게임
// /games?releaseStatus=upcoming&sortBy=popular&page=1&size=10 인기 출시 예정 게임
// /games?sortBy=discountPercentage&page=1&size=10 특별 할인

//신규 및 특집
// /games?releaseStatus=upcoming&page=1&size=10 모든 출시 예정 게임
// /games?minPrice=0&maxPrice=0&page=1&size=10 인기 무료 게임

router.get("/", parseGameQuery, async (req, res, next) => {
  try {
    const {
      page = 1,
      size = 10,
      searchTerm,
      category,
      minPrice,
      maxPrice = Infinity,
      sortBy,
      releaseStatus = "all",
    } = req.query ?? {};

    const targetDate = new Date();
    targetDate.setHours(0, 0, 0, 0);

    const filter = { releaseAt: { $lte: targetDate } };
    if (searchTerm) filter["$text"] = { $search: searchTerm };
    if (category) filter["category"] = { $in: category.split(",") };
    if (minPrice) {
      filter["price"] = { $gte: Number(minPrice), $lte: Number(maxPrice) };
    }
    if (releaseStatus === "upcoming") {
      targetDate.setDate(targetDate.getDate() + 1);
      filter["releaseAt"] = { $gte: targetDate };
    } else if (releaseStatus === "recent") {
      targetDate.setDate(targetDate.getDate() - 30);
      filter["releaseAt"] = { $gte: targetDate, $lte: new Date() };
    }

    const sort = sortBy
      ? {
          "popular": { wishlistCount: -1 }, // 인기순
          "title": { title: 1 }, // 이름 오름차순
          "price": { price: 1 }, // 가격 낮은 순
          "-price": { price: -1 }, // 가격 높은 순
          "discountPercentage": { discountPercentage: -1 }, // 할인 높은 순
          "releaseAt": { releaseAt: -1 }, // 최신 출시일 기준
        }[sortBy]
      : { createdAt: -1 };

    const limit = Number(size);
    const skip = (page - 1) * limit;
    const games = await Game.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    games.id = games._id;
    delete games._id;
    const totalCount = await Game.countDocuments(filter);
    const hasMore = page * limit < totalCount;

    return res.status(200).json({ list: games, hasMore, totalCount });
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

router.post("/", auth, validateGameFields, async (req, res, next) => {
  try {
    await Game.create(req.body);
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", auth, validateGameFields, async (req, res, next) => {
  try {
    await Game.findByIdAndUpdate(req.params.id, req.body);
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
