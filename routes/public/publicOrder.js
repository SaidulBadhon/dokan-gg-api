const express = require("express");
const route = express.Router();

const randomNumber = require("../../utils/randomNumber");
const sortProductsForOrder = require("../../utils/sortProductsForOrder");

const Order = require("../../models/order");
const Product = require("../../models/product");

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

        // console.log(data);

        await Notification.insertMany([
          {
            sender: req.user._id,
            receiverRole: "super",
            type: "product",
            content: {
              productId: product._id,
              message: `${product?.name} submitted for review`,
            },
          },
          {
            sender: req.user._id,
            receiverRole: "admin",
            type: "product",
            content: {
              productId: product._id,
              message: `${product?.name} submitted for review`,
            },
          },
          {
            sender: req.user._id,
            receiverRole: "admin",
            type: "product",
            content: {
              productId: product._id,
              message: `${product?.name} submitted for review`,
            },
          },
        ]);

        await Order.create(data);
      })
    );
    return res.status(200).json({ status: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Fail to create a order" });
  }
});

module.exports = route;
