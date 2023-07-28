const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");
const Brand = require("../../models/brand");

route.get("/", async (req, res) => {
  try {
    const stores = await Store.find({
      status: "active",
      isArchived: false,
      isDeleted: false,
    }).select({ slug: 1, updatedAt: 1 });

    const products = await Product.find({
      status: "active",
      isArchived: false,
      isDeleted: false,
    })
      .select({ slug: 1, updatedAt: 1, store: 1 })
      .populate({
        path: "store",
        select: { slug: 1 },
      });

    const brands = await Brand.find({
      status: "active",
    }).select({ slug: 1, updatedAt: 1 });

    return res.status(200).json({ stores, products, brands });
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = route;
