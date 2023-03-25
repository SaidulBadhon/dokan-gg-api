const express = require("express");
const route = express.Router();

const Category = require("../../models/category");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "", filter = "{}", companyId } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const categories = await Category.find({ company: companyId })
        .populate("company")
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(categories);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await Category.countDocuments({ user: req.user._id });

      return res.status(200).json(count);
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
  })
  .post("/", async (req, res) => {
    try {
      const category = await Category.create({
        ...req.body,
        createdBy: req?.user?._id,
      });

      return res.status(200).json(category);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a category" });
    }
  })
  .put("/", async (req, res) => {
    const category = await Category.findByIdAndUpdate(
      { _id: req.category._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(category);
  })
  .put("/:id", async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      $upsert: true,
    });

    res.status(200).json(category);
  })
  .delete("/:id", async (req, res) => {
    await Category.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
