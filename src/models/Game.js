const { default: mongoose } = require("mongoose");

const gameSchema = mongoose.Schema(
  {
    gameIndex: Number,
    title: {
      type: String,
      required: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    thumbnail: {
      type: Array,
      default: [],
    },
    screenshots: {
      type: Array,
      default: [],
    },
    categories: {
      type: Array,
      default: [],
    },
    tags: Array,
    releaseAt: {
      type: Date,
      required: true,
    },
    detailImages: {
      type: Array,
      default: [],
    },
    options: {
      type: [
        {
          name: String,
          price: Number,
        },
      ],
    },
    wishlistCount: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      max: 100,
      default: 0,
    },
    discountPeriod: {
      start: Date,
      end: Date,
    },
    totalRating: {
      type: Number,
      default: 0,
    },
    totalRater: {
      type: Number,
      default: 0,
    },
    detailInfo: {
      contentDescriptors: String,
      ageRating: Number,
      ratingNumber: String,
      ratingDate: String,
      businessName: String,
      distributionLicenseNumber: String,
      publisher: String,
      franchise: String,
      developer: String,
    },
    recommendedRequirements: {
      os: String,
      processor: String,
      memory: String,
      graphics: String,
      network: String,
      storage: String,
    },
    minimumRequirements: {
      os: String,
      processor: String,
      memory: String,
      graphics: String,
      network: String,
      storage: String,
    },
  },
  {
    timestamps: true,
  }
);

gameSchema.index(
  {
    title: "text",
    // description: "text",
  }
  // {
  //   weights: {
  //     title: 5,
  //     description: 1,
  //   },
  // }
);

const Game = mongoose.model("Game", gameSchema);

module.exports = Game;
