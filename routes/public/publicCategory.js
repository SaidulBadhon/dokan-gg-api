const express = require("express");
const route = express.Router();

const Category = require("../../models/category");

route
  .get("/", async (req, res) => {
    try {
      const categories = await Category.find({
        $or: [{ parentId: { $exists: false } }, { parentId: { $eq: "" } }],
      });

      return res.status(200).json(categories);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const category = await Category.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      });

      return res.status(200).json(category);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Category does not exist." });
    }
  });

module.exports = route;
