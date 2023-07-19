const express = require("express");
const route = express.Router();

const Brand = require("../../models/brand");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const stores = await Brand.find({ status: "active" })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await Brand.countDocuments({ status: "active" });

      return res.status(200).json({
        result: stores,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Brand profile does not exist." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let store;

      if (objectIdRegex.test(req.params.id)) {
        store = await Brand.findOne({ _id: req.params.id, status: "active" });
      } else {
        store = await Brand.findOne({ slug: req.params.id, status: "active" });
      }

      if (store) {
        return res.status(200).json(store);
      } else {
        res.status(500).send({ error: "Brand profile does not exist." });
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Brand profile does not exist." });
    }
  });

module.exports = route;
