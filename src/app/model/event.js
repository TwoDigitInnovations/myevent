"use strict";

const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    desc: {
      type: String,
    },
    img: {
      type: String,
    },
    options: [
      {
        title: {
          type: String,
        },
        players: [{ type: mongoose.Types.ObjectId, ref: "User" }],
      },
    ],
    amount: {
      type: String,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    player: [
      {
        ans_id: {
          type: mongoose.Types.ObjectId,
        },
        paricipant_id: {
          type: mongoose.Types.ObjectId,
          ref: "User",
        },
        event_id: {
          type: mongoose.Types.ObjectId,
          ref: "Event",
        },
      },
    ],
    ans: {
      type: mongoose.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

eventSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("Event", eventSchema);
