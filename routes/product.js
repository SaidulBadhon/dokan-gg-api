const express = require("express");
const route = express.Router();

const Product = require("../models/product");
const Order = require("../models/order");

route.post(`/:productId/comment`, async (req, res) => {
  try {
    // const products = await Product.find({ status: "active", featured: true });
    const { rating, comment } = req.body;
    console.log(" XXXXXXXXXXXXXXXXX +", req.body);

    const checkValidOrder = await Order.findOne({
      customer: req?.user?._id,
      products: { $elemMatch: { product: req.params.productId } },
      status: { $in: ["pending", "processing", "completed"] },
    });

    const newReview = {
      rating: rating,
      comment: comment,
      createdBy: req?.user?._id,
      verified: checkValidOrder ? true : false, // Assuming the review is verified, you can adjust it based on your logic
    };

    const products = await Product.findByIdAndUpdate(
      req.params.productId,
      {
        $push: { "rating.reviews": newReview },
        $inc: {
          "rating.totalRating": rating,
          "rating.totalReviews": 1,
        },
      },
      { new: true }
    );

    // console.log(JSON.stringify(products));

    return res.status(200).json(products);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Faild to get featured products." });
  }
});

module.exports = route;
