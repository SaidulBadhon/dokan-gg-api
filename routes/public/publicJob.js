const express = require("express");
const route = express.Router();

const Apply = require("../../models/apply");
const Job = require("../../models/job");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const {
      search,
      companyId: company,
      sort,
      type,
      categories,
      salary,
      userId,
    } = JSON.parse(filter);

    let typeFilterQuery;
    if (type?.length > 0) {
      typeFilterQuery = { type: { $in: type } };
    } else {
      typeFilterQuery = {};
    }

    let categoriesFilterQuery;
    if (categories?.length > 0) {
      categoriesFilterQuery = { categories: { $in: categories } };
    } else {
      categoriesFilterQuery = {};
    }

    const filterExp =
      {
        $and: [
          { ...(company && { company }) },
          {
            title: {
              $regex: search,
              $options: "i",
            },
          },
          typeFilterQuery,
          categoriesFilterQuery,
        ],
      } || {};

    try {
      // const countDocuments = await Job.estimatedDocumentCount(filterExp);
      const countDocuments = await Job.countDocuments(filterExp);

      const result = await Job.find(filterExp)
        .populate("company")
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      let resultAgg;

      if (userId) {
        resultAgg = await Promise.all(
          result?.map(async (item) => {
            // const company = await await Company.findById(item._id);
            const apply = await Apply.findOne({
              job: item?._id,
              applicantUser: userId,
            });

            return {
              ...item.toObject(),
              apply,
            };
          })
        );
      } else {
        resultAgg = result;
      }

      return res.status(200).json({
        result: resultAgg,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await Job.estimatedDocumentCount();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      // const job = await Job.findByIdAndUpdate(req.params.id, { $inc: { view: 1 }}).populate("company");
      const job = await Job.findByIdAndUpdate(req.params.id, {
        $push: { view: new Date(Date.now()) },
      }).populate("company");

      let otherJobs = await Job.find({ company: job?.company?._id })
        .sort({
          view: -1,
        })
        .limit(6);

      const similarJobns = otherJobs?.map((jb) => {
        return {
          company: {
            logo: job?.company?.logo,
            name: job?.company?.name,
            headquarter: job?.company?.headquarter,
            officeLocations: job?.company?.officeLocations,
          },
          categories: jb.categories,
          title: jb.title,
          _id: jb?._id,
          type: jb?.type,
          requireJapaneseLanguage: jb?.requireJapaneseLanguage,
          sponsorVISA: jb?.sponsorVISA,
        };
      });

      console.log("========> ", req.query?.userId);
      const apply = await Apply.findOne({
        job: job?._id,
        applicantUser: req.query?.userId,
      });
      console.log("========> ", apply);

      return res.status(200).json({ ...job.toObject(), apply, similarJobns });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Job profile does not exist." });
    }
  });

module.exports = route;
