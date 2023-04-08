const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const store = require("./store");

const locationTree = require("./useful/locationTree");
const addressBook = require("../models/addressBook");

const notification = require("./notification");

const publicStore = require("./public/store");

// All Routes
router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/stores", allowIfLogin, store);
router.use("/locationTree", locationTree);
router.use("/addressBook", addressBook);

router.use("/notification", allowIfLogin, notification);

router.use("/public/stores", publicStore);

module.exports = router;
