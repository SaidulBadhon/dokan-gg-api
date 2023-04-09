const express = require("express");
const route = express.Router();

const Store = require("../models/store");

route
  .get("/", async (req, res) => {
    res.status(200), send("Store Page");
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
      const store = await Store.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      });

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const store = await Store.create({
        ...req.body,
      });

      console.log(store);

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a store" });
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
      });
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
