const express = require("express");
const route = express.Router();

const Order = require("../models/order");
const randomNumber = require("../utils/randomNumber");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const orders = await Order.find({ customer: req.user._id })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(orders);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      // const count = await Order.estimatedDocumentCount({ user: req.user._id });
      const count = await Order.countDocuments({ user: req.user._id });

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const order = await Order.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      }).populate("company");

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Order profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      // const products = {
      //   product:
      //   variant:
      //   quantity :
      // }

      const data = {
        invoiceNumber: randomNumber(),

        status:
          req.body?.paymentMethod === "cashOnDelivery"
            ? "processing"
            : "pendingPayment",

        // producst
        // total

        ...req.body,
        // customer
        // coupon - check validity
        // paymentMethod
        // if bkash trxId
      };

      console.log(data);

      // const order = await Order.create({
      //   ...req.body,
      //   createdBy: req?.user?._id,
      // });

      const order = {};

      console.log(order);

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a order" });
    }
  })
  .put("/", async (req, res) => {
    const order = await Order.findByIdAndUpdate(
      { _id: req.order._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(order);
  })
  .put("/:id", async (req, res) => {
    console.log("+================== > ", req.params.id, " - ", req.body);
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      $upsert: true,
    });

    res.status(200).json(order);
  })
  .delete("/:id", async (req, res) => {
    await Order.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
