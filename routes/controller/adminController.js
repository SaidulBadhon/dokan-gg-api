const express = require("express");
const route = express.Router();

const Company = require("../../models/company");
const Job = require("../../models/job");
const Partner = require("../../models/admin/partner");

route
  .put("/ourPartners", async (req, res) => {
    try {
      const partner = await Partner.findOneAndUpdate(
        { index: req.body.index },
        req.body,
        { upsert: true }
      );

      return res.status(200).json(partner);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/allJobs", async (req, res) => {
    const jobs = await Job.find({ featured: { $in: [null, false] } }).populate({
      path: "company",
      select: { name: 1, logo: 1, headquarter: 1, officeLocations: 1 },
    });
    return res.status(200).json(jobs);
  })
  .get("/featuredJobs", async (req, res) => {
    const jobs = await Job.find({ featured: true }).populate({
      path: "company",
      select: { name: 1, logo: 1, headquarter: 1, officeLocations: 1 },
    });
    return res.status(200).json(jobs);
  })
  .get("/allCompanies", async (req, res) => {
    const companies = await Company.find({
      featured: { $in: [null, false] },
    }).populate({
      path: "company",
      select: { name: 1, logo: 1, headquarter: 1, officeLocations: 1 },
    });
    return res.status(200).json(companies);
  })
  .get("/featuredCompanies", async (req, res) => {
    const companies = await Company.find({ featured: true }).populate({
      path: "company",
      select: { name: 1, logo: 1, headquarter: 1, officeLocations: 1 },
    });
    return res.status(200).json(companies);
  });

module.exports = route;
