const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const notification = require("./notification");
const order = require("./order");
const product = require("./product");

const locationTree = require("./_components/locationTree");

// sellers routes
const sellerDashboard = require("./sellers/sellerDashboard");
const sellerStore = require("./sellers/sellerStore");
const sellerProduct = require("./sellers/sellerProduct");
const sellerOrders = require("./sellers/sellerOrders");
const sellerCategory = require("./sellers/sellerCategory");
const sellerBrand = require("./sellers/sellerBrand");

// admin routes
const adminCategory = require("./admin/adminCategory");
const adminBrand = require("./admin/adminBrand");
const adminUser = require("./admin/adminUser");

// public routes
const publicStore = require("./public/publicStore");
const publicBrands = require("./public/publicBrands");
const publicProduct = require("./public/publicProduct");
const publicOrder = require("./public/publicOrder");
const publicCategory = require("./public/publicCategory");
const publicHome = require("./public/publicHome");
const public = require("./public");

// --------------------------------------- \\

// All Routes
router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/notification", allowIfLogin, notification);

router.use("/locationTree", locationTree);
router.use("/orders", allowIfLogin, order);
router.use("/products", allowIfLogin, product);

// sellers routes
router.use("/sellers/dashboard", allowIfLogin, sellerDashboard);
router.use("/sellers/stores", allowIfLogin, sellerStore);
router.use("/sellers/products", allowIfLogin, sellerProduct);
router.use("/sellers/orders", allowIfLogin, sellerOrders);
router.use("/sellers/categories", allowIfLogin, sellerCategory);
router.use("/sellers/brands", allowIfLogin, sellerBrand);

// admin routes
// router.use("/admin/stores", allowIfLogin, adminStore);
// router.use("/admin/products", allowIfLogin, adminProduct);
router.use("/admin/categories", allowIfLogin, adminCategory);
router.use("/admin/brands", allowIfLogin, adminBrand);
router.use("/admin/users", allowIfLogin, adminUser);

// public routes
router.use("/public", public);
router.use("/public/home", publicHome);
router.use("/public/stores", publicStore);
router.use("/public/brands", publicBrands);
router.use("/public/products", publicProduct);
router.use("/public/orders", publicOrder);
router.use("/public/categories", publicCategory);

module.exports = router;
