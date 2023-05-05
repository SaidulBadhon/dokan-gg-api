const express = require("express");
const route = express.Router();

const Brand = require("../../models/brand");

route
  .get("/", async (req, res) => {
    try {
      // const brands = await Brand.find({
      //   $or: [{ parentId: { $exists: false } }, { parentId: { $eq: "" } }],
      // });
      const brands = await Brand.find();

      return res.status(200).json(brands);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);

      return res.status(200).json(brand);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Brand does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const product = await Brand.create({
        ...req.body,
        slug: slugify(req.body.name),
        createdBy: req?.user?._id,
      });

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a product" });
    }
  });

module.exports = route;
