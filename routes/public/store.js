const express = require("express");
const route = express.Router();

const Store = require("../../models/store");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const stores = await Store.find()
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(stores);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await Store.countDocuments();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      console.log(req.params.id);

      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let store;

      if (objectIdRegex.test(req.params.id)) {
        store = await Store.findById(req.params.id);
      } else {
        store = await Store.findOne(req.params.id);
      }

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  });

module.exports = route;
