const express = require("express");
const route = express.Router();

const randomNumber = require("../../utils/randomNumber");
const sortProductsForOrder = require("../../utils/sortProductsForOrder");

const Order = require("../../models/order");
const Product = require("../../models/product");
const Notification = require("../../models/notification");

route.post("/", async (req, res) => {
  try {
    const productsArray = await Product.find({
      _id: { $in: req.body?.products?.map((i) => i.product) },
    }).select({ price: 1 });

    // console.log(sortProductsForOrder(products));
    let productsRow = [];

    Object.entries(productsArray)?.map((item) => {
      let newObj = req.body.products?.find(
        (p) => p?.product === item[1]?._id.toString()
      );
      newObj["price"] = item[1].price;
      productsRow.push(newObj);
    });

    const storeGroupedProdcuts = sortProductsForOrder(productsRow);
    // console.log("storeGroupedProdcuts : ", storeGroupedProdcuts);

    await Promise.all(
      storeGroupedProdcuts.map(async (products) => {
        let subTotal = 0.0;

        products?.map((newObj) => {
          subTotal += newObj?.quantity * newObj?.price;
        });

        console.log("products : ", products);

        const data = {
          invoiceNumber: randomNumber(),
          // customer: req.user._id,

          // ? "processing"
          status:
            req.body?.paymentMethod === "cashOnDelivery"
              ? "pending"
              : "pendingPayment",

          subTotal,

          total:
            subTotal +
            (req.body?.deliveryFee || 60) -
            (req.body?.discount || 0),
          ...req.body,
          products: products,
          store: products[0].store,

          // coupon - check validity
          // paymentMethod
          // if bkash trxId
        };

        const order = await Order.create(data);

        await Notification.insertMany([
          {
            receiverRole: "super",
            type: "order",
            content: {
              orderId: order._id,
              message: "New order placed. Please review the order!",
            },
          },
          {
            receiverRole: "admin",
            type: "order",
            content: {
              orderId: order._id,
              message: "New order placed. Please review the order!",
            },
          },
        ]);
      })
    );
    return res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Fail to create a order" });
  }
});

module.exports = route;
