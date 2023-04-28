const OneSignal = require("@onesignal/node-onesignal");
const mongoose = require("mongoose");
const Device = mongoose.model("Device");
const Notification = mongoose.model("Notification");
const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;

const app_key_provider = {
  getToken() {
    return process.env.ONESIGNAL_REST_API_KEY;
  },
};
const configuration = OneSignal.createConfiguration({
  authMethods: {
    app_key: {
      tokenProvider: app_key_provider,
    },
  },
});
const client = new OneSignal.DefaultApi(configuration);

module.exports = {
  push: async (type, content, job = null) => {
    const devices = await Device.find();
    let player_ids = devices.map((d) => d.player_id);
    // const notObj = { for: user, message: content };
    // if (job) notObj.event = job;
    await Notification.create({
      event_id: job?._id,
      message: content,
      type,
    });
    const notification = new OneSignal.Notification();
    notification.app_id = ONESIGNAL_APP_ID;
    notification.include_player_ids = player_ids;
    notification.contents = {
      en: content,
    };
    notification.name = "Opinion Trade";
    notification.data = job;
    return await client.createNotification(notification);
  },
};
