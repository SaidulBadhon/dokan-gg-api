const express = require("express");
const route = express.Router();

const Category = require("../../models/category");

route
  .get("/", async (req, res) => {
    try {
      const categories = await Category.find({
        parent: { $exists: false },
      }).exec();

      return res.status(200).json(categories);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:parentId", async (req, res) => {
    try {
      const categories = await Category.find({ parent: req.params.parentId });

      return res.status(200).json(categories);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Category does not exist." });
    }
  });

module.exports = route;
