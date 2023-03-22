const express = require("express");
const route = express.Router();

const Company = require("../models/company");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "" } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const companies = await Company.find()
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(companies);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const company = await Company.findOne({ user: req.params.id });

      return res.status(200).json(company);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Company profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const company = await Company.create({
        ...req.body,
        createdBy: req?.user?._id,
      });

      console.log(company);

      return res.status(200).json(company);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a company" });
    }
  })
  .put("/", async (req, res) => {
    const company = await Company.findByIdAndUpdate(
      { _id: req.company._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(company);
  })
  .put("/:id", async (req, res) => {
    const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
      $upsert: true,
    });

    res.status(200).json(company);
  })
  .put("/:companyId/officeLocations/add", async (req, res) => {
    try {
      if (req.body?.headquarter) {
        const task1 = await Company.findByIdAndUpdate(req.params.companyId, {
          $pull: { officeLocations: { address: req.body?.address } },
          headquarter: req.body,
        });
        // const task2 = await Company.findByIdAndUpdate(req.params.companyId, {
        //   headquarter: req.body,
        // });
      } else {
        const company = await Company.findByIdAndUpdate(
          req.params.companyId,
          { $addToSet: { officeLocations: req.body } },
          { upsert: true }
        );
      }

      res.status(200).json({ status: "success" });
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  })
  .delete(
    "/:companyId/officeLocations/:officeLocationsId/remove",
    async (req, res) => {
      try {
        const company = await Company.findByIdAndUpdate(req.params.companyId, {
          $pull: { officeLocations: { _id: req.params.officeLocationsId } },
        });

        res.status(200).json(company);
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  )
  .delete("/:id", async (req, res) => {
    await Company.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
