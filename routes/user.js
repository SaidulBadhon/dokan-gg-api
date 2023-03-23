const express = require("express");
const route = express.Router();
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const getAccessToken = (userId) =>
  jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

route
  .get("/", async (req, res) => {
    const { sort = "", range = "" } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const users = await User.find()
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      const count = await User.estimatedDocumentCount();

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:email", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.params.email });

      accessToken = getAccessToken(user._id);

      // const applicant = await Applicant.findOne({ user: user?._id });

      // if (user?.role === "applicant") {
      //   let applicant = await Applicant.findOne({ user: user._id });

      //   return res.status(200).json({
      //     ...user.toObject(),
      //     accessToken,
      //     applicant,
      //   });
      // } else if (user?.role === "company") {
      //   let company = await Company.findOne({ user: user._id });

      //   return res.status(200).json({
      //     ...user.toObject(),
      //     accessToken,
      //     company,
      //   });
      // } else {
      return res.status(200).json({ ...user.toObject(), accessToken });
      // }

      // console.log("=======================> ", applicant);
      // return res
      //   .status(200)
      //   .json({ ...user.toObject(), accessToken, applicant });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "User does not exist." });
    }
  })
  .post("/acceptEULA", async (req, res, next) => {
    try {
      const updateUser = await User.findByIdAndUpdate(req.user._id, {
        acceptEUlA: !req.user?.acceptEUlA || true,
      });
      return res.status(200).send(updateUser);
    } catch (err) {
      return res.status(500).send(err);
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
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { $upsert: true }
    );

    res.status(200).json(user);
  })
  .delete("/:id", async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
