const mongoose = require("mongoose");
const Event = mongoose.model("Event");
const response = require("./../responses");
const { findById } = require("../model/event");
const notification = require("../services/notification");
const Wallet = mongoose.model("Wallet");
const Notification = mongoose.model("Notification");

module.exports = {
  createEvent: async (req, res) => {
    try {
      const payload = req?.body;

      const event = new Event({
        title: payload?.title,
        desc: payload?.desc,
        img: payload?.img,
        options: payload?.options,
        amount: payload?.amount,
      });
      const ev = await event.save();
      notification.push(
        "Hello guys! A new event has just been created. Check it out now and join the fun!",
        ev
      );
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

    let event = await Event.findOne({ _id: payload?.event_id });
    let opt = event.options.find(
      (f) => f._id?.toString() === payload?.ans_id.toString()
    );
    if (opt.players.includes(payload?.paricipant_id)) {
      return response.badReq(res, { message: "Ans allready given" });
    }
    const wallet = await Wallet.findOne({ user_id: payload.paricipant_id });
    if (wallet?.balance > 0 && wallet?.balance > event?.amount) {
      await Wallet.findOneAndUpdate(
        { user_id: payload.paricipant_id },
        {
          balance: wallet?.balance - event?.amount,
          credit:
            wallet?.credit >= event?.amount
              ? wallet?.credit - event?.amount
              : wallet?.credit,
        }
      );

      opt.players.push(payload?.paricipant_id);

      let byId = await Event.findById(payload.event_id);
      event.wallet = byId?.wallet
        ? byId?.wallet + Number(event?.amount)
        : Number(event?.amount);
      console.log(event);
      const updatedEvent = await Event.findByIdAndUpdate(
        payload.event_id,
        event,
        { new: true, upsert: true }
      );

      return response.created(res, updatedEvent);
    } else {
      return response.notFound(res, { message: "Not sufficient balance" });
    }
  },

  addParticipant2: async (req, res) => {
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
      const existEvent = await Event.findById(payload?.event_id);
      if (existEvent && !existEvent?.ans) {
        let ev = await Event.findByIdAndUpdate(payload?.event_id, payload, {
          new: true,
          upsert: true,
        });
        console.log(ev);
        notification.push(
          "The wait is over! Your final answer has been generated, and we're eager to reveal it to you.",
          ev
        );
        let userlist = ev.options.find(
          (f) => f._id.toString() === ev?.ans.toString()
        )?.players;
        console.log(userlist);
        if (userlist?.length > 0) {
          let amount = Number(ev?.wallet) - Number(ev?.wallet) / 10;

          let userAmount = Number(amount) / Number(userlist?.length);
          console.log(userAmount);
          userlist.forEach(async (element) => {
            const wallet = await Wallet.findOne({
              user_id: element,
            });
            console.log(wallet);
            if (wallet) {
              await Wallet.findOneAndUpdate(
                { user_id: element },
                {
                  balance: wallet?.balance + userAmount,
                }
              );
            }
          });
        }

        return res.status(201).json({
          success: true,
          message: "Event Saved successfully!",
          data: ev,
        });
      } else {
        return response.badReq(res, { message: "Ans allready given" });
      }
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
      options: { $elemMatch: { players: payload.paricipant_id } },
    });
    return response.ok(res, job);
  },

  getNotification: async (req, res) => {
    const job = await Notification.find().populate("event_id");
    return response.ok(res, job);
  },
};
