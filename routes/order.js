const express = require("express");
const route = express.Router();

const randomNumber = require("../utils/randomNumber");
const sortProductsForOrder = require("../utils/sortProductsForOrder");

const Product = require("../models/product");
const Order = require("../models/order");
const Notification = require("../models/notification");

route
  .get("/", async (req, res) => {
    try {
      console.log("req.user : ", req.user?._id);

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
            customer: req.user._id,

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

          // notify supers, admins about the order
          // notify customer about the order
          // // notify store owner about the order
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
            {
              receiver: req.user._id,
              type: "system",
              content: {
                message: `Order placed successfully. After processing, seller will contact you with further details.`,
                orderId: order._id,
                // message: `Order placed successfully. Your order will be delivered within ${data?.deliveryDate}`,
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
