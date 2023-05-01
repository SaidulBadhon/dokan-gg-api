const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const generateRandomString = require("../../utils/generateRandomString");
const slugify = require("../../utils/slugify");
// const { AddressBook } = require("../../models/addressBook");

route
  .get("/", async (req, res) => {
    try {
      const { range = "", filter = "{}" } = req.query;
      const rangeExp = range && JSON.parse(range);

      const stores = await Store.find({
        $or: [
          { owner: req?.user?._id },
          { managers: req?.user?._id },
          { employees: req?.user?._id },
        ],
      })
        .populate({
          path: "owner",
          select: { avatar: 1, firstName: 1, lastName: 1, email: 1 },
        })
        .populate({
          path: "managers",
          select: { avatar: 1, firstName: 1, lastName: 1, email: 1 },
        })
        .populate({
          path: "employees",
          select: { avatar: 1, firstName: 1, lastName: 1, email: 1 },
        })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await Store.countDocuments({
        $or: [
          { owner: req?.user?._id },
          { managers: req?.user?._id },
          { employees: req?.user?._id },
        ],
      });

      return res.status(200).json({
        result: stores,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Faild to load stores." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Store does not exist." });
    }
  })
  // .get("/:id/addressBook", async (req, res) => {
  //   try {
  //     const addressBook = await AddressBook.find({ store: req.params.id });

  //     return res.status(200).json(addressBook);
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).send({ error: "Store profile does not exist." });
  //   }
  // })
  .post("/", async (req, res) => {
    try {
      const store = await Store.create({
        ...req.body,
        slug: slugify(req.body.name) + generateRandomString(4),
        owner: req?.user?._id,
      });

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Fail to create a store" });
    }
  })
  .put("/", async (req, res) => {
    const store = await Store.findByIdAndUpdate(
      { _id: req.store._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(store);
  })
  .put("/:id", async (req, res) => {
    const store = await Store.findById(req.params.id);

    if (
      [...store.managers.toString(), store.owner.toString()].includes(
        req.user._id.toString()
      )
    ) {
      const store = await Store.findByIdAndUpdate(req.params.id, req.body, {
        $upsert: true,
        new: true,
      });
      console.log(store);
      res.status(200).json(store);
    } else {
      res.status(401).send({
        message: "You are not an authorized owner or manager of this store.",
      });
    }
  })
  .delete("/:id", async (req, res) => {
    await Store.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
