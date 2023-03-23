const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const notification = require("./notification");

router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/notification", allowIfLogin, notification);

module.exports = router;
