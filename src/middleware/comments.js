const User = require("../models/User");

const createNewCommenter = async (req, res, next) => {
  if (!req.body.isNewUser) next();
  try {
    const lastUser = await User.findOne().sort({ joinIndex: -1 });
    const joinIndex = lastUser?.joinIndex ? lastUser.joinIndex + 1 : 1;
    const dummyCommenter = await User.create({
      nickname: `테스트유저${joinIndex}`,
      email: `testUser${joinIndex}@gamefestival.com`,
      password: `test1234!`,
      gender: "male",
      joinIndex,
    });
    req.dummyCommenter = dummyCommenter;
    next();
  } catch (err) {}
};

module.exports = { createNewCommenter };
