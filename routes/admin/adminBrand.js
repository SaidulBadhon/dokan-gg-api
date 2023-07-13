const express = require("express");
const route = express.Router();

const Brand = require("../../models/brand");

route
  .get("/", async (req, res) => {
    try {
      const brands = await Brand.find().populate("parentId");

      return res.status(200).json(brands);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/", async (req, res) => {
    try {
      const brand = await Brand.create({
        ...req.body,
        status: "active",
        createdBy: req?.user?._id,
      });

      return res.status(200).json(brand);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a brand" });
    }
  })
  .put("/:id", async (req, res) => {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
      $upsert: true,
      new: true,
    });

    res.status(200).json(brand);
  })
  .delete("/:id", async (req, res) => {
    await Brand.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
