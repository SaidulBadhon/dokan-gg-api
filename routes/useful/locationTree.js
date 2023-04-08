const express = require("express");
const route = express.Router();

const LocationTree = require("../../models/useful/locationTree");

route
  .get("/province", async (req, res) => {
    try {
      const data = await LocationTree.find({ parentId: { $exists: false } });
      return res.status(200).json(data);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/cities/:provinceId", async (req, res) => {
    try {
      const data = await LocationTree.find({ parentId: req.params.provinceId });
      return res.status(200).json(data);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/areas/:cityId", async (req, res) => {
    try {
      const data = await LocationTree.find({ parentId: req.params.cityId });
      return res.status(200).json(data);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await LocationTree.countDocuments();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const locationTree = await LocationTree.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      });

      return res.status(200).json(locationTree);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "LocationTree profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const items = LocationTree.create({
        ...req.body,
        createdBy: req?.user?._id,
      });

      return res.status(200).json(items);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a locationTree" });
    }
  })
  .put("/", async (req, res) => {
    const locationTree = await LocationTree.findByIdAndUpdate(
      { _id: req.locationTree._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(locationTree);
  })
  .put("/:id", async (req, res) => {
    console.log("+================== > ", req.params.id, " - ", req.body);
    const locationTree = await LocationTree.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        $upsert: true,
      }
    );

    res.status(200).json(locationTree);
  })
  .delete("/:id", async (req, res) => {
    await LocationTree.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
