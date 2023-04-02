const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const store = require("./store");
const notification = require("./notification");

router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/stores", allowIfLogin, store);
router.use("/notification", allowIfLogin, notification);

module.exports = router;
