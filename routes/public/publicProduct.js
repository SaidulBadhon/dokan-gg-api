const express = require("express");
const route = express.Router();

const Product = require("../../models/product");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { store, search, status, sortBy } = JSON.parse(filter);

    let storeFilterQuery = store ? { store } : {};
    let statusFilterQuery = status ? { status } : {};

    const filterExp =
      {
        $and: [
          storeFilterQuery,
          statusFilterQuery,
          {
            $or: [
              {
                title: {
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
      const products = await Product.find(filterExp)
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sortBy || { "views.count": -1 });
      // .sort({ createdAt: -1 });
      // .populate({
      //   path: "store",
      //   select: { logo: 1, name: 1, slug: 1 },
      // })

      const countDocuments = await Product.countDocuments(filterExp);

      return res.status(200).json({
        result: products,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .get("/:id/similar", async (req, res) => {
    try {
      const products = await Product.aggregate([
        { $sample: { size: parseInt(req.query.limit || 5) } },
      ]);

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      // const product = await Product.findByIdAndUpdate(req.params.id, {
      //   $inc: { view: 1 },
      // });

      // Update the view count of a product
      const product = await Product.findOneAndUpdate(
        { _id: req.params.id }, // Replace 'product_id' with the actual ID of the product you want to update
        {
          $inc: { "views.count": 1 },
          $push: {
            "views.viewers": {
              ip: req.ip,
              referer: req.headers.referer || req.headers.referrer,
            },
          },
        },
        { new: true, upsert: true }
      ).populate({
        path: "store",
        select: {
          name: 1,
          slug: 1,
        },
      });
      // // Update the rating of a product
      // const product = await Product.findOneAndUpdate(
      //   { _id: req.params.id }, // Replace 'product_id' with the actual ID of the product you want to update
      //   {
      //     $inc: { "rating.totalRating": 4, "rating.totalReviews": 1 },
      //     $push: { "rating.reviews": { rating: 4, comment: "Great product!" } },
      //   },
      //   { new: true }
      // )
      //   .then((updatedProduct) => {
      //     console.log("Product updated:", updatedProduct);
      //   })
      //   .catch((error) => {
      //     console.error("Failed to update product:", error);
      //   });

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  });

module.exports = route;
