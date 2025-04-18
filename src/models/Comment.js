const { default: mongoose } = require("mongoose");

const commentSchema = mongoose.Schema(
  {
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    writer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    playTime: {
      type: Number,
      default: 0,
    },
    isRecommended: {
      type: Boolean,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

commentSchema.index({
  content: "text",
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
