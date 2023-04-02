const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const store = require("./store");
const publicStore = require("./public/store");

const notification = require("./notification");

// All Routes
router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/stores", allowIfLogin, store);

router.use("/public/stores", publicStore);

router.use("/notification", allowIfLogin, notification);

module.exports = router;
