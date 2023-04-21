const mongoose = require("mongoose");
const Event = mongoose.model("Event");
const response = require("./../responses");
const Wallet = mongoose.model("Wallet");

module.exports = {
  createEvent: async (req, res) => {
    try {
      const payload = req?.body;

      const event = new Event({
        title: payload?.title,
        desc: payload?.desc,
        img: payload?.img,
        options: payload?.options,
      });
      const ev = await event.save();
      return res.status(201).json({
        success: true,
        message: "Event Saved successfully!",
        data: ev,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getAllEvent: async (req, res) => {
    const job = await Event.find();
    return response.ok(res, job);
  },

  addParticipant: async (req, res) => {
    const payload = req?.body;
    let participant = {
      ans_id: payload?.ans_id,
      paricipant_id: payload?.paricipant_id,
      event_id: payload?.event_id,
    };
    let query = {
      _id: payload?.event_id,
      "player.paricipant_id": payload.paricipant_id,
    };
    const event = await Event.findOne(query);

    if (event) {
      const updateDocument = {
        $set: {
          "player.$.ans_id": payload?.ans_id,
          "player.$.paricipant_id": payload?.paricipant_id,
          "player.$.event_id": payload?.event_id,
        },
      };

      const evt = await Event.updateOne(query, updateDocument, {
        new: true,
        upsert: true,
      });
      return response.created(res, { message: "Answer updated successfully" });
    } else {
      const wallet = await Wallet.findOne({ user_id: payload.paricipant_id });
      console.log(wallet);
      if (wallet?.balance > 0 && wallet?.balance > payload.amount) {
        await Wallet.findOneAndUpdate(
          { user_id: payload.paricipant_id },
          {
            balance: wallet?.balance - payload.amount,
            credit:
              wallet?.credit >= payload.amount
                ? wallet?.credit - payload.amount
                : wallet?.credit,
          }
        );

        let byId = await Event.findById(payload.event_id);
        const ev = await Event.findByIdAndUpdate(
          payload.event_id,
          {
            $push: { player: participant },
            wallet: byId?.wallet
              ? byId?.wallet + payload.amount
              : payload.amount,
          },
          { new: true, upsert: true }
        );

        return response.created(res, ev);
      } else {
        return response.notFound(res, { message: "Not sufficient balance" });
      }
    }
  },

  updateEvent: async (req, res) => {
    try {
      const payload = req?.body;

      const ev = await Event.findByIdAndUpdate(payload?.event_id, payload, {
        new: true,
        upsert: true,
      });
      return res.status(201).json({
        success: true,
        message: "Event Saved successfully!",
        data: ev,
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  getEventsByParticipant: async (req, res) => {
    const payload = req.body;
    const job = await Event.find({
      player: { $elemMatch: { paricipant_id: payload.paricipant_id } },
    });
    return response.ok(res, job);
  },
};
