const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");
const slugify = require("../../utils/slugify");

route
  .get("/", async (req, res) => {
    try {
      const stores = await Store.find({
        $or: [
          { owner: req?.user?._id },
          { managers: req?.user?._id },
          { employees: req?.user?._id },
        ],
      });

      const products = await Product.find({ store: { $in: stores } }).populate({
        path: "store",
        select: { logo: 1, name: 1, slug: 1 },
      });

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await Product.countDocuments();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      });

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const product = await Product.create({
        ...req.body,
        slug: slugify(req.body.name),
        owner: req?.user?._id,
      });

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a product" });
    }
  })
  .put("/", async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      { _id: req.product._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(product);
  })
  .put("/:id", async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (
      [...product.managers.toString(), product.owner.toString()].includes(
        req.user._id.toString()
      )
    ) {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        $upsert: true,
      });
      res.status(200).json(product);
    } else {
      res.status(401).send({
        message: "You are not an authorized owner or manager of this product.",
      });
    }
  })
  .delete("/:id", async (req, res) => {
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
