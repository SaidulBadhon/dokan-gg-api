const express = require("express");
const route = express.Router();

const Product = require("../models/product");
const Order = require("../models/order");
const randomNumber = require("../utils/randomNumber");

route
  .get("/", async (req, res) => {
    try {
      const orders = await Order.find({ customer: req.user._id })
        .select({
          status: 1,
          createdAt: 1,
          deliveryDate: 1,
          total: 1,
        })
        .sort({ createdAt: -1 });
      return res.status(200).json(orders);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate({
        path: "products.product",
        select: { name: 1, images: 1, price: 1 },
      });

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Order does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const productsArray = await Product.find({
        _id: { $in: req.body?.products?.map((i) => i.product) },
      }).select({ price: 1 });

      let products = [];
      let subTotal = 0.0;

      Object.entries(productsArray)?.map((item) => {
        let newObj = req.body.products?.find(
          (p) => p?.product === item[1]?._id.toString()
        );
        newObj["price"] = item[1].price;
        subTotal += newObj.quantity * newObj.price;
        products.push(newObj);
      });

      const data = {
        invoiceNumber: randomNumber(),
        customer: req.user._id,

        status:
          req.body?.paymentMethod === "cashOnDelivery"
            ? "processing"
            : "pendingPayment",

        subTotal,

        total:
          subTotal + (req.body?.deliveryFee || 80) - (req.body?.discount || 0),
        ...req.body,
        products: products,

        // coupon - check validity
        // paymentMethod
        // if bkash trxId
      };
      // console.log(data);
      const order = await Order.create(data);

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
