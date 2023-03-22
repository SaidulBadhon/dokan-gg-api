const express = require("express");
const route = express.Router();

const Job = require("../models/job");

route
  .get("/", async (req, res) => {
    // let filterExp;

    const { sort = "", range = "", filter = "{}", companyId } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const jobs = await Job.find({ company: companyId })
        .populate("company")
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(jobs);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      // const count = await Job.estimatedDocumentCount({ user: req.user._id });
      const count = await Job.countDocuments({ user: req.user._id });

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
      }).populate("company");

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
