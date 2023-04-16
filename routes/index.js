const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const store = require("./store");
const notification = require("./notification");

const locationTree = require("./useful/locationTree");
const addressBook = require("./addressBook");

// sellers routes
const sellerStore = require("./sellers/store");
const sellerProduct = require("./sellers/product");

// admin routes
const adminStore = require("./admin/store");
const adminProduct = require("./admin/product");

// public routes
const publicStore = require("./public/store");

// --------------------------------------- \\

// All Routes
router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/stores", allowIfLogin, store);
router.use("/notification", allowIfLogin, notification);

router.use("/locationTree", locationTree);
router.use("/addressBook", allowIfLogin, addressBook);

// sellers routes
router.use("/sellers/stores", allowIfLogin, sellerStore);
router.use("/sellers/products", allowIfLogin, sellerProduct);

// admin routes
router.use("/admin/stores", allowIfLogin, adminStore);
router.use("/admin/products", allowIfLogin, adminProduct);

// public routes
router.use("/public/stores", publicStore);

module.exports = router;
