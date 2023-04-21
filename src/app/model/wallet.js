"use strict";

const mongoose = require("mongoose");
const walletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
    },
    withdraw: {
      type: Number,
    },
    credit: {
      type: Number,
    },
    user_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

walletSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Wallet", walletSchema);
