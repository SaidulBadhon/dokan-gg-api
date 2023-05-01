const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const notification = require("./notification");
const order = require("./order");

const locationTree = require("./_components/locationTree");
// const addressBook = require("./__unused/addressBook");

// sellers routes
const sellerDashboard = require("./sellers/sellerDashboard");
const sellerStore = require("./sellers/sellerStore");
const sellerProduct = require("./sellers/sellerProduct");
const sellerOrders = require("./sellers/sellerOrders");

// admin routes
const adminCategory = require("./admin/adminCategory");
const adminStore = require("./admin/adminStore");
const adminProduct = require("./admin/adminProduct");
const adminUsers = require("./admin/adminUsers");

// public routes
const publicStore = require("./public/publicStore");
const publicProduct = require("./public/publicProduct");
const publicOrder = require("./public/publicOrder");
const publicCategory = require("./public/publicCategory");

// --------------------------------------- \\

// All Routes
router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/notification", allowIfLogin, notification);

router.use("/locationTree", locationTree);
// router.use("/addressBook", allowIfLogin, addressBook);
router.use("/orders", allowIfLogin, order);

// sellers routes
router.use("/sellers/dashboard", allowIfLogin, sellerDashboard);
router.use("/sellers/stores", allowIfLogin, sellerStore);
router.use("/sellers/products", allowIfLogin, sellerProduct);
router.use("/sellers/orders", allowIfLogin, sellerOrders);

// admin routes
router.use("/admin/stores", allowIfLogin, adminStore);
router.use("/admin/products", allowIfLogin, adminProduct);
router.use("/admin/categories", allowIfLogin, adminCategory);
router.use("/admin/users", allowIfLogin, adminUsers);

// public routes
router.use("/public/stores", publicStore);
router.use("/public/products", publicProduct);
router.use("/public/orders", publicOrder);
router.use("/public/categories", publicCategory);

module.exports = router;
