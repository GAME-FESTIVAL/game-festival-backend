const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  nickname: {
    type: String,
    maxLength: 50,
  },
  email: {
    type: String,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    minLength: 8,
  },
  gender: String,
  interests: {
    type: Array,
    default: [],
  },
  profileImage: String,
  cart: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Game",
    default: [],
  },
  wishlist: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Game",
    default: [],
  },
  votedComments: {
    type: [
      {
        commentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Comment",
          required: true,
        },
        voteType: {
          type: String,
          enum: ["helpful", "notHelpful"],
          required: true,
        },
      },
    ],
  },
  orderHistory: {
    type: Array,
    default: [],
  },
  role: {
    type: Number,
    default: 0,
  },
});

userSchema.pre("save", async function (next) {
  let user = this;
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  let user = this;
  const result = await bcrypt.compare(password, user.password);
  return result;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
