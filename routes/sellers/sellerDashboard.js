const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");
const Order = require("../../models/order");

route.get("/", async (req, res) => {
  try {
    let totalRevenue = 0;
    let totalCustomers = [];
    let totalOrders = 0;
    let totalProducts = 0;
    let totalStores = 0;

    const stores = await Store.find({
      $or: [
        { owner: req?.user?._id },
        { managers: req?.user?._id },
        { employees: req?.user?._id },
      ],
    }).select({ _id: 1 });

    const products = await Product.find({
      store: { $in: stores },
    }).select("views");

    const orders = await Order.find({
      "products.product": { $in: products?.map((p) => p._id) },
    }).select({ total: 1, status: 1 });

    totalRevenue = orders
      .filter((order) => order.status === "completed")
      .reduce((total, order) => {
        return total + (order?.total || 0);
      }, 0);

    products.forEach((product) => {
      product.views.viewers.forEach((viewer) => {
        const ipAddress = viewer.ip;
        if (totalCustomers[ipAddress]) {
          totalCustomers[ipAddress] += viewer.count;
        } else {
          totalCustomers[ipAddress] = viewer.count;
        }
      });
    });

    totalOrders = orders.length;
    totalProducts = products.length;
    totalStores = stores.length;

    return res.status(200).json({
      totalRevenue,
      totalCustomers: Object.keys(totalCustomers).length,
      totalOrders,
      totalProducts,
      totalStores,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Product profile does not exist." });
  }
});

module.exports = route;
