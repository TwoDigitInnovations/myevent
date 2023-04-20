"use strict";
const router = require("express").Router();
const user = require("../../app/controller/user");
const event = require("../../app/controller/event");
const isAuthenticated = require("./../../middlewares/isAuthenticated");

router.post("/login", user.login);
router.post("/signUp", user.signUp);

router.post(
  "/profile/changePassword",
  isAuthenticated(["USER", "PROVIDER"]),
  user.changePasswordProfile
);

router.post("/getProfile", user.getProfile);
router.post("/updateProfile", user.updateProfile);

//event
router.post("/create-event", event.createEvent);
router.get("/get-event", event.getAllEvent);
router.post("/add-participant", event.addParticipant);
router.post("/update-event", event.updateEvent);

module.exports = router;
