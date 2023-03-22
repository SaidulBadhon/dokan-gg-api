const express = require("express");
const route = express.Router();

const Company = require("../../models/company");
const Job = require("../../models/job");

route
  .get("/", async (req, res) => {
    // const { sort = "", range = "", filter = "{}" } = req.query;
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { search, sort, type, industry } = JSON.parse(filter);

    let typeFilterQuery;
    if (type?.length > 0) {
      typeFilterQuery = { type: { $in: type } };
    } else {
      typeFilterQuery = {};
    }

    let industryFilterQuery;
    if (industry?.length > 0) {
      industryFilterQuery = { industry: { $in: industry } };
    } else {
      industryFilterQuery = {};
    }

    const filterExp =
      {
        $and: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },
          typeFilterQuery,
          industryFilterQuery,
        ],
      } || {};

    try {
      // const countDocuments = await Company.estimatedDocumentCount(filterExp);
      const countDocuments = await Company.countDocuments(filterExp);

      const companies = await Company.find(filterExp)
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      let results = [];

      const items = await Promise.all(
        companies.map(async (company) => {
          const jobsCount = await Job.countDocuments({
            company: company?._id,
          });
          results?.push({ ...company, jobs: jobsCount });
          return {
            ...company.toObject(),
            jobs: jobsCount,
          };
        })
      );

      return res.status(200).json({
        result: items,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await Company.estimatedDocumentCount();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/recommended", async (req, res) => {
    try {
      const companies = await Company.find({ featured: true });

      let results = [];

      const items = await Promise.all(
        companies.map(async (company) => {
          const jobsCount = await Job.countDocuments({
            company: company?._id,
          });
          results?.push({ ...company, jobs: jobsCount });
          return {
            ...company.toObject(),
            jobs: jobsCount,
          };
        })
      );

      return res.status(200).json(items);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      // const company = await Company.findByIdAndUpdate(req.params.id, {$inc: { view: 1 }}).populate("company");
      const company = await Company.findByIdAndUpdate(req.params.id, {
        $push: { view: new Date(Date.now()) },
      });

      const jobs = await Job.find({ company: company?._id })
        .sort({
          view: -1,
        })
        .limit(6);

      const jobsCount = await Job.countDocuments({ company: company?._id });

      let openJobs = [];

      jobs?.map((job) => {
        openJobs.push({
          company: {
            logo: company?.logo,
            name: company?.name,
            headquarter: company?.headquarter,
            officeLocations: company?.officeLocations,
          },
          categories: job.categories,
          title: job.title,
          _id: job?._id,
        });
      });
      console.log(JSON.stringify(openJobs, null, 4));

      return res
        .status(200)
        .json({ ...company.toObject(), openJobs, jobs: jobsCount });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Company does not exist." });
    }
  });

module.exports = route;
