const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Payment = require("../models/Payment");

router.post("/", auth, async (req, res, next) => {
  const { user, body } = req;
  const { cartDetail } = body;
  const { _id, name, email, cart } = user;
  const orderer = { id: _id, name, email };

  const orderedGames = cartDetail.map((game) => {
    return {
      ...game,
      id: game._id,
      paymentId: crypto.randomUUID(),
    };
  });

  const orderTotal = orderedGames.reduce(
    (acc, { price, discountPercentage }) =>
      acc + applyDiscount(price, discountPercentage),
    0
  );

  const orderedAt = new Date().toISOString();

  const updatedCart = cart
    .filter(({ id }) => !cartDetail.some(({ _id }) => _id === id))
    .map(({ id }) => id);

  try {
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $push: { orderHistory: { orderedGames, orderTotal, orderedAt } },
        $set: { cart: updatedCart },
      }
    );
    await Payment.create({ orderer, orderedGames, orderTotal, orderedAt });
    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

const applyDiscount = (price, discountPercentage) => {
  if (!discountPercentage || discountPercentage <= 0) return price;
  const discountAmount = (price * discountPercentage) / 100;
  return Math.round(price - discountAmount);
};

module.exports = router;
