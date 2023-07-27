const express = require("express");
const route = express.Router();

const User = require("../../models/user");

route
  .get("/", async (req, res) => {
    const { range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { search } = JSON.parse(filter);

    const filterExp =
      {
        $or: [
          {
            firstName: { $regex: search, $options: "i" },
          },
          {
            lastName: { $regex: search, $options: "i" },
          },
          {
            userName: { $regex: search, $options: "i" },
          },
          {
            email: { $regex: search, $options: "i" },
          },
        ],
      } || {};

    try {
      const users = await User.find(filterExp)
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await User.countDocuments(filterExp);

      return res.status(200).json({
        result: users,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "User profile does not exist." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      });

      return res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "User profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const user = await User.create({
        ...req.body,
        owner: req?.user?._id,
      });

      return res.status(200).json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a user" });
    }
  })
  .put("/", async (req, res) => {
    const user = await User.findByIdAndUpdate(
      { _id: req.user._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(user);
  })
  .put("/:id", async (req, res) => {
    if (["super", "admin"].includes(req.user.role)) {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        $upsert: true,
      });
      res.status(200).json(user);
    } else {
      res.status(401).send({
        message: "You are not an authorized admin.",
      });
    }
  })
  .delete("/:id", async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
