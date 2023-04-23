const express = require("express");
const route = express.Router();

const Order = require("../../models/order");
const randomNumber = require("../../utils/randomNumber");

route.post("/", async (req, res) => {
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
});

module.exports = route;
