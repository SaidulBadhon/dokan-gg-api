const express = require("express");
const route = express.Router();

const Job = require("../models/job");
const Applicant = require("../models/applicant");
const Apply = require("../models/apply");
const Notification = require("../models/notification");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "", dateTime = "" } = req.query;
    const rangeExp = dateTime && JSON.parse(dateTime);

    let filter;
    if (rangeExp.startDate && rangeExp?.endDate) {
      filter = {
        createdAt: {
          $gte: new Date(rangeExp?.startDate),
          $lt: new Date(rangeExp?.endDate),
        },
      };
    } else {
      filter = {};
    }

    try {
      const applys = await Apply.find({
        applicantUser: req.user._id,
        ...filter,
      })
        .populate({
          path: "company",
          select: { name: 1, logo: 1 },
        })
        .populate({
          path: "job",
          select: { title: 1 },
        })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(applys);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const apply = await Apply.findOne({ user: req.params.id });

      return res.status(200).json(apply);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Apply profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const applicantUser = req?.user?._id;
      // company: ,
      // job

      // linkedInURL: ,
      // additionalInformation: ,
      // resumeURL: ,

      const checkIfYouCanApply = await Job.findById(req.body.job);

      if (
        checkIfYouCanApply?.applications?.length >= checkIfYouCanApply?.needs
      ) {
        return res.status(200).json({
          error: "Sorry! This job listing is not taking any new applications.",
        });
      }

      const applicantProfile = await Applicant.findOne({
        user: req?.user?._id,
      });

      const apply = await Apply.create({
        ...req.body,
        applicantUser,
        applicantProfile: applicantProfile?._id,
      });

      const job = await Job.findByIdAndUpdate(
        req.body.job,
        { $addToSet: { applications: apply?._id } },
        { upsert: true }
      );

      // Start of notification
      let notification = {
        receiver: job.user,
        sender: req.user._id,
        content: {
          job: job?._id,
        },
        type: "Appy",
      };

      await Notification.create(notification);
      // End of notification

      return res.status(200).json(apply);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a apply" });
    }
  })
  .put("/", async (req, res) => {
    const apply = await Apply.findByIdAndUpdate(
      { _id: req.user._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(apply);
  })
  .put("/:id", async (req, res) => {
    console.log("+================== > ", req.body);
    const apply = await Apply.findByIdAndUpdate(req.params.id, req.body, {
      $upsert: true,
    });

    res.status(200).json(apply);
  })
  .delete("/:id", async (req, res) => {
    await Apply.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
