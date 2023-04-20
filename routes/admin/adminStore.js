const express = require("express");
const route = express.Router();

const Store = require("../../models/store");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { assignedTo = "", search, status, sort = "" } = JSON.parse(filter);

    let statusFilterQuery = status ? { status } : {};

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
        owner: req?.user?._id,
      });

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
      ) ||
      req.user.role === "admin"
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
