const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { assignedTo = "", search, status, sort = "" } = JSON.parse(filter);

    // let statusFilterQuery = status ? { status } : {};
    let statusFilterQuery = { status: "active" };

    const filterExp =
      {
        $and: [
          { ...(assignedTo && { assignedTo }) },
          statusFilterQuery,
          {
            $or: [
              {
                name: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                slug: {
                  $regex: search,
                  $options: "i",
                },
              },
            ],
          },
        ],
      } || {};

    try {
      const stores = await Store.find(filterExp)
        .select({ owner: 0, managers: 0, employees: 0 })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await Store.countDocuments(filterExp);

      return res.status(200).json({
        result: stores,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  })
  .get("/ids", async (req, res) => {
    try {
      const stores = await Store.find({
        status: "active",
        isDeleted: false,
        isArchived: false,
      }).select({
        slug: 1,
      });

      return res.status(200).json(stores);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "stores does not exist." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let store;

      if (objectIdRegex.test(req.params.id)) {
        store = await Store.findOne({ _id: req.params.id, status: "active" });
      } else {
        store = await Store.findOne({ slug: req.params.id, status: "active" });
      }

      if (store) {
        return res.status(200).json(store);
      } else {
        res.status(500).send({ error: "Store profile does not exist." });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  })
  .get("/:id/products", async (req, res) => {
    try {
      const products = await Product.find({
        store: req.params.id,
        status: "active",
        isDeleted: false,
        isArchived: false,
      }).select({
        slug: 1,
      });

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Products does not exist." });
    }
  })
  .get("/:id/products/:productId", async (req, res) => {
    try {
      const store = await Store.findOne({
        slug: req.params.id,
        status: "active",
      }).select({ _id: 1, name: 1, slug: 1, delivery: 1, logo: 1 });

      const product = await Product.findOne({
        store: store?._id,
        slug: req.params.productId,
        status: "active",
        isDeleted: false,
        isArchived: false,
      })
        .populate({
          path: "brand",
          select: { name: 1, slug: 1 },
        })
        .populate({
          path: "rating.reviews.createdBy",
          select: {
            firstName: 1,
            lastName: 1,
            userName: 1,
            avatar: 1,
          },
        })
        .select({ views: 0 });

      return res.status(200).json({ ...product?.toObject(), store });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Products does not exist." });
    }
  })
  .get("/:id/feature", async (req, res) => {
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let products;

      if (objectIdRegex.test(req.params.id)) {
        // store = await Store.findById(req.params.id);

        products = await Product.find({
          store: req.params.id,
          status: "active",
        })
          .limit(req.query.limit || 5)
          .populate({
            path: "store",
            select: { logo: 1, name: 1, slug: 1 },
          });
      } else {
        let store = await Store.findOne({ slug: req.params.id });

        products = await Product.find({
          store: store?._id,
          status: "active",
        })
          .limit(req.query.limit || 5)
          .populate({
            path: "store",
            select: { logo: 1, name: 1, slug: 1 },
          });
      }

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Faild to get featured products." });
    }
  });

module.exports = route;
