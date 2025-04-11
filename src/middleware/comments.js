const User = require("../models/User");
const Comment = require("../models/Comment");

const createNewCommenter = async (req, res, next) => {
  try {
    if (req.body.writer !== "newUser") {
      req.dummyCommenter = { _id: req.body.writer };
      return next();
    }
    const lastUser = await User.findOne().sort({ joinIndex: -1 });
    const joinIndex = lastUser?.joinIndex ? lastUser.joinIndex + 1 : 1;
    const dummyCommenter = await User.create({
      nickname: `테스트유저${joinIndex}`,
      email: `testuser${joinIndex}@gamefestival.com`,
      password: `test1234!`,
      gender: "male",
      joinIndex,
    });
    req.dummyCommenter = dummyCommenter;
    next();
  } catch (err) {}
};

const checkAlreadyCommented = async (req, res, next) => {
  try {
    const writer = req?.user?._id || req?.body?.writer;
    const { gameId } = req.body;
    const existing = await Comment.findOne({ writer, gameId });
    if (existing) {
      return res
        .status(409)
        .json({ message: "이미 해당 게임에 리뷰를 작성했습니다." });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { createNewCommenter, checkAlreadyCommented };
