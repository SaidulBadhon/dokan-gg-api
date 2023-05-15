const express = require("express");
const route = express.Router();

const Product = require("../../models/product");

route
  .get("/search", async (req, res) => {
    const { search = "", range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    // const { search } = JSON.parse(filter);
    console.log(search);

    const query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { tags: { $in: [search] } },
        { shortDescription: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { color: { $regex: search, $options: "i" } },
        {
          specifications: {
            $elemMatch: {
              $or: [
                { key: { $regex: search, $options: "i" } },
                { value: { $regex: search, $options: "i" } },
              ],
            },
          },
        },
      ],
    };

    // const filterExp =
    //   {
    //     $or: [
    //       {
    //         name: {
    //           $regex: search,
    //           $options: "i",
    //         },
    //       },
    //       {
    //         searchTags: {
    //           $regex: search,
    //           $options: "i",
    //         },
    //       },
    //     ],
    //   } || {};

    try {
      const products = await Product.find(query);
      // .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
      // .skip(rangeExp.length && rangeExp[0])
      // .sort(sortBy || { "views.count": -1 })
      // .populate({
      //   path: "store",
      //   select: { logo: 1, name: 1, slug: 1 },
      // });
      // .sort({ createdAt: -1 });

      // const countDocuments = await Product.countDocuments(query);

      return res.status(200).json({
        result: products,
        // count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Products does not exist." });
    }
  })
  .get("/feature", async (req, res) => {
    try {
      let products = await Product.aggregate([
        { $match: { status: "active" } },
        { $sample: { size: parseInt(req.query?.limit) || 10 } },
      ]);
      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Faild to get featured products." });
    }
  })
  .get("/:id/similar", async (req, res) => {
    try {
      const products = await Product.aggregate([
        { $match: { status: "active" } },
        { $sample: { size: parseInt(req.query.limit || 5) } },
      ]);

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Faild to get similar products." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let productQuery = objectIdRegex.test(req.params.id)
        ? { _id: req.params.id, status: "active" }
        : { slug: req.params.id, status: "active" };

      // Update the view count of a product
      const product = await Product.findOneAndUpdate(
        productQuery, // Replace 'product_id' with the actual ID of the product you want to update
        {
          $inc: { "views.count": 1 },
          $push: {
            "views.viewers": {
              ip: req.ip,
              referer: req.headers.referer || req.headers.referrer,
            },
          },
        },
        { new: true }
        // { new: true, upsert: true }
      )
        .populate({
          path: "store",
          select: {
            name: 1,
            slug: 1,
          },
        })
        .select({ views: 0 });
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
      res.status(500).send({ error: "Product does not exist." });
    }
  });

module.exports = route;
