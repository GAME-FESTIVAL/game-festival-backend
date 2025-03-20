const { default: mongoose } = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    orderer: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    orderedGames: {
      type: [
        {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Game",
            required: true,
          },
          paymentId: {
            type: String,
            required: true,
          },
          title: {
            type: String,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
    orderTotal: {
      type: Number,
      required: true,
    },
    orderedAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
