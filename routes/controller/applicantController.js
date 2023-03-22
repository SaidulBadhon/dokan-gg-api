const express = require("express");
const route = express.Router();

const Apply = require("../../models/apply");

route
  .get("/dashboard/count", async (req, res) => {
    const { range = "" } = req.query;
    const rangeExp = range && JSON.parse(range);

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

    const totalApplies = await Apply.countDocuments({
      applicantUser: req.user._id,
      ...filter,
    });

    const totalInterviewd = await Apply.countDocuments({
      applicantUser: req.user._id,
      stage: { $in: ["Interviewing", "Offered", "Hired", "Declined"] },
      ...filter,
    });

    return res.status(200).json({ totalApplies, totalInterviewd });
  })
  .get("/dashboard/recent", async (req, res) => {
    const { range = "" } = req.query;
    const rangeExp = range && JSON.parse(range);

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

    const applies = await Apply.find({ applicantUser: req.user._id, ...filter })
      .populate({
        path: "company",
        select: {
          _id: 1,
          name: 1,
          logo: 1,
          headquarter: 1,
          officeLocations: 1,
          type: 1,
        },
      })
      .populate({
        path: "job",
        select: {
          title: 1,
        },
      })
      .sort({
        createdAt: -1,
      })
      .limit(9);
    return res.status(200).json(applies);
  });

module.exports = route;
