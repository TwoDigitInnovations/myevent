"use strict";
const router = require("express").Router();
const user = require("../../app/controller/user");
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

module.exports = router;
