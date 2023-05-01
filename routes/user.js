const express = require("express");
const route = express.Router();
const Customer = require("../models/customer");
const Store = require("../models/store");

const User = require("../models/user");
// const { AddressBook } = require("../models/addressBook");
const getAccessToken = require("../utils/getAccessToken");
const hashPassword = require("../utils/hashPassword");
const validatePassword = require("../utils/validatePassword");

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
  .get("/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      accessToken = getAccessToken(user._id);

      if (["seller", "manager", "employee"].includes(user?.role)) {
        let stores = await Store.find({ owner: user._id }).select({
          owner: 0,
          managers: 0,
          employees: 0,
        });

        return res.status(200).json({
          ...user.toObject(),
          accessToken,
          stores,
        });
      } else if (user?.role === "buyer") {
        let customer = await Customer.findOne({ user: user._id });

        return res.status(200).json({
          ...user.toObject(),
          accessToken,
          customer,
        });
      } else {
        return res.status(200).json({ ...user.toObject(), accessToken });
      }
    } catch (err) {
      res.status(500).send({ message: "User does not exist." });
    }
  })
  // .get("/:id/addressBook", async (req, res) => {
  //   try {
  //     // const addressBook = await AddressBook.find({ user: req.params.id });

  //     // return res.status(200).json(addressBook);
  //     return res.status(200);
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).send({ message: "Address book does not exist." });
  //   }
  // })
  // .delete("/:id/addressBook/:addressBookId", async (req, res) => {
  //   try {
  //     // const addressBook = await AddressBook.findById(addressBook);

  //     // return res.status(200).json(addressBook);
  //     return res.status(200);
  //   } catch (err) {
  //     console.log(err);
  //     res.status(500).send({ message: "Address book does not exist." });
  //   }
  // })
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
  .post("/changePassword", async (req, res, next) => {
    try {
      const { oldPassword, newPassword } = req.body;

      const user = await User.findById(req.user._id);

      if (user.password) {
        const validPassword = await validatePassword(
          oldPassword,
          user.password
        );
        console.log({ validPassword });

        if (!validPassword) return next(new Error("Password is not correct"));
      }

      const hashedPassword = await hashPassword(newPassword);

      const updatedUser = await User.findByIdAndUpdate(user?._id, {
        password: hashedPassword,
      });

      res.status(200).json(updatedUser);
    } catch (err) {
      console.log(err);
      next(err);
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
