const express = require("express");
const route = express.Router();

const Partner = require("../../models/admin/partner");
const Job = require("../../models/job");
const Company = require("../../models/company");

route
  .get("/ourPartners", async (req, res) => {
    try {
      const partners = await Partner.find().sort({ index: 1 });

      return res.status(200).json(partners);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/jobCount", async (req, res) => {
    try {
      const data = await Job.aggregate([
        { $group: { _id: "$categories", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]);

      let count = data?.map((item) => {
        return {
          category: item?._id[0],
          count: item?.count,
        };
      });
      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/featuredjobs", async (req, res) => {
    try {
      // make 2 group, 1: all the featured jobs; 2: show 4 jobs where view is the highest
      const featuredJobs = await Job.find({ featured: true })
        .populate({
          path: "company",
          select: {
            _id: 1,
            name: 1,
            logo: 1,
            headquarter: 1,
            officeLocations: 1,
          },
        })
        .limit(4);

      const topJobs = await Job.find({ featured: { $in: [null, false] } })
        .populate({
          path: "company",
          select: {
            _id: 1,
            name: 1,
            logo: 1,
            headquarter: 1,
            officeLocations: 1,
          },
        })
        .sort({ view: -1 })
        .limit(8 - (featuredJobs?.length || 0));

      return res.status(200).json({ featuredJobs, topJobs });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/latestJobs", async (req, res) => {
    try {
      const latestJobs = await Job.find()
        .populate({
          path: "company",
          select: {
            _id: 1,
            name: 1,
            logo: 1,
            headquarter: 1,
            officeLocations: 1,
          },
        })
        .limit(8);

      return res.status(200).json(latestJobs);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/companiesResults/:category", async (req, res) => {
    try {
      const jobAggregate = await Job.aggregate([
        { $match: { categories: [req.params.category] } },
        { $group: { _id: "$company", job: { $sum: 1 } } },
      ]);

      const companiesAgg = await Promise.all(
        jobAggregate?.map(async (item) => {
          const company = await await Company.findById(item._id);

          return {
            ...company.toObject(),
            jobs: item?.job,
          };
        })
      );

      return res.status(200).json(companiesAgg);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

module.exports = route;
