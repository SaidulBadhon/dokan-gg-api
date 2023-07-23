const express = require("express");
const route = express.Router();
const Customer = require("../models/customer");
const Store = require("../models/store");
const User = require("../models/user");

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
        let stores = await Store.find({
          $and: [
            {
              $or: [
                { owner: user?._id },
                { managers: { $in: [user?._id] } },
                { employees: { $in: [user?._id] } },
              ],
            },
            { isDeleted: false },
          ],
        }).select({
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
  .put("/:id/addressBook", async (req, res) => {
    try {
      // const addressBook = await AddressBook.find({ user: req.params.id });

      const customer = await Customer.findOneAndUpdate(
        { user: req.params.id },
        {
          $push: {
            addressBook: req.body,
          },
        },
        { new: true, upsert: true }
      );

      if (!customer) {
        throw new Error("Customer not found");
      }

      // const user = req.user.populate("addressBook").execPopulate();

      return res.status(200).json(customer.addressBook);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Address book does not exist." });
    }
  })
  .put("/:id/addressBook/:addressBookId", async (req, res) => {
    try {
      // const addressBook = await AddressBook.find({ user: req.params.id });
      // async function updateAddressBook(customerId, addressBookId, updatedAddressBook) {

      try {
        // const updatedAddressBook = updatedCustomer.addressBook.find(
        //   (addressBook) =>
        //     addressBook._id.toString() === req.params.addressBookId
        // );

        // if (!updatedAddressBook) {
        //   throw new Error("AddressBook not found");
        // }

        const { createdAt, updatedAt, ...others } = req.body;
        console.log(others);

        // { $set: { "addressBook.$": others } },
        const updatedCustomer = await Customer.findOneAndUpdate(
          { user: req.params.id, "addressBook._id": req.params.addressBookId },
          {
            $set: {
              "addressBook.$.fullName": others?.fullName,
              "addressBook.$.mobile": others?.mobile,
              "addressBook.$.email": others?.email,
              "addressBook.$.address": others?.address,
              "addressBook.$.province": others?.province,
              "addressBook.$.city": others?.city,
              "addressBook.$.area": others?.area,
              "addressBook.$.updatedAt": new Date(), // Set the updatedAt field to the current date/time
            },
          },
          { new: true }
        );

        if (!updatedCustomer) {
          throw new Error("Customer or AddressBook not found");
        }

        return res.status(200).send(updatedCustomer.addressBook);
      } catch (error) {
        throw new Error("Failed to update addressBook: " + error.message);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Address book does not exist." });
    }
  })
  .put("/:id/wishlist", async (req, res) => {
    try {
      const customer = await Customer.findOneAndUpdate(
        { user: req.params.id },
        {
          $push: {
            wishlist: req.body,
          },
        },
        { new: true, upsert: true }
      );
      res.status(200).json(customer.wishlist);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Wishlist does not exist." });
    }
  })
  .delete("/:id/addressBook/:addressBookId", async (req, res) => {
    try {
      const customerId = req.params.id;
      const addressBookItemId = req.params.addressBookId;

      console.log({ customerId, addressBookItemId });

      const updatedCustomer = await Customer.findOneAndUpdate(
        { user: req.params.id },
        { $pull: { addressBook: { _id: req.params.addressBookId } } },
        { new: true }
      );
      //   console.log("customer : ", customer);
      return res.status(200).json(updatedCustomer?.addressBook);
    } catch (err) {
      console.log("XD  : ", err);

      res.status(500).send({ message: "Address book does not exist." });
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
