const express = require("express");
const route = express.Router();

const Order = require("../../models/order");
const randomNumber = require("../../utils/randomNumber");

route.post("/", async (req, res) => {
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
      // customer:req.user._id,

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
});

module.exports = route;
