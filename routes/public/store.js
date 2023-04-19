const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const { AddressBook } = require("../../models/addressBook");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { assignedTo = "", search, status, sort = "" } = JSON.parse(filter);

    // let statusFilterQuery = status ? { status } : {};
    let statusFilterQuery = { status: "active" };

    const filterExp =
      {
        $and: [
          { ...(assignedTo && { assignedTo }) },
          statusFilterQuery,
          {
            $or: [
              {
                name: {
                  $regex: search,
                  $options: "i",
                },
              },
              {
                slug: {
                  $regex: search,
                  $options: "i",
                },
              },
            ],
          },
        ],
      } || {};

    try {
      const stores = await Store.find(filterExp)
        .select({ owner: 0, managers: 0, employees: 0 })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await Store.countDocuments(filterExp);

      return res.status(200).json({
        result: stores,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
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
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let store;

      if (objectIdRegex.test(req.params.id)) {
        store = await Store.findById(req.params.id);
      } else {
        store = await Store.findOne({ slug: req.params.id });
      }

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  })
  .get("/:id/addressBook", async (req, res) => {
    try {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;

      let store;

      if (objectIdRegex.test(req.params.id)) {
        store = await Store.findById(req.params.id).select({ _id: 1 });
      } else {
        store = await Store.findOne(req.params.id).select({ _id: 1 });
      }

      const addressBook = await AddressBook.find({ store });

      return res.status(200).json(addressBook);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  })
  .delete("/:id/addressBook/:addressBookId", async (req, res) => {
    try {
      const addressBook = await AddressBook.findById(addressBook);

      return res.status(200).json(addressBook);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  });

module.exports = route;
