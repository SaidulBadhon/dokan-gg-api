const express = require("express");
const route = express.Router();

const Store = require("../models/store");

route
  .get("/", async (req, res) => {
    res.status(200), send("Store Page");
  })
  .get("/count", async (req, res) => {
    try {
      const count = await Job.countDocuments();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const job = await Job.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      });

      return res.status(200).json(job);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Job profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      console.log("==================> ", req.body);
      const job = await Job.create({ ...req.body, createdBy: req?.user?._id });

      console.log(job);

      return res.status(200).json(job);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a job" });
    }
  })
  .put("/", async (req, res) => {
    const job = await Job.findByIdAndUpdate(
      { _id: req.job._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(job);
  })
  .put("/:id", async (req, res) => {
    console.log("+================== > ", req.params.id, " - ", req.body);
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      $upsert: true,
    });

    res.status(200).json(job);
  })
  .delete("/:id", async (req, res) => {
    await Job.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
