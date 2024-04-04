const mongoose = require("mongoose");

const url = new mongoose.Schema(
  {
    long: {
      type: String,
      required: true,
    },
    short: {
      type: String,
      required: true,
    },
    suffix: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("URL", url);
