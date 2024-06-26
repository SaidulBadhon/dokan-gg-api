const express = require("express");
const route = express.Router();

const Order = require("../../models/order");
const Product = require("../../models/product");
const Store = require("../../models/store");
const slugify = require("../../utils/slugify");
const generateRandomString = require("../../utils/generateRandomString");
const Notification = require("../../models/notification");

route
  .get("/", async (req, res) => {
    try {
      const { range = "", filter = "{}" } = req.query;
      const rangeExp = range && JSON.parse(range);

      let stores = [];

      if (["admin", "super"].includes(req?.user?.role)) {
        stores = await Store.find().select({ _id: 1 });
      } else {
        stores = await Store.find({
          $or: [
            { owner: req?.user?._id },
            { managers: req?.user?._id },
            { employees: req?.user?._id },
          ],
        }).select({ _id: 1 });
      }

      const products = await Product.find({
        store: { $in: stores },
      }).select("views");

      const orders = await Order.find({
        "products.product": { $in: products?.map((p) => p._id) },
      })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 })
        .select({
          invoiceNumber: 1,
          deliveryFee: 1,
          total: 1,
          createdAt: 1,
          status: 1,
          deliveryAddress: 1,
        });

      const countDocuments = await Product.countDocuments({
        "products.product": { $in: products?.map((p) => p._id) },
      });

      return res.status(200).json({
        result: orders,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const order = await Order.findOne({
        invoiceNumber: req.params.id,
      }).populate({
        path: "products.product",
        select: { name: 1, price: 1, images: 1 },
      });

      console.log("Order: ", order);

      return res.status(200).json(order);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "order does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const product = await Product.create({
        ...req.body,
        slug: slugify(req.body.name) + "_" + generateRandomString(4),
        createdBy: req?.user?._id,
      });

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a product" });
    }
  })
  .put("/", async (req, res) => {
    const product = await Product.findByIdAndUpdate(
      { _id: req.product._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(product);
  })
  .put("/:id", async (req, res) => {
    // $upsert: true,
    // new: true,
    try {
      console.log("XXXXXXXXXXXXXX XXXXXXXXXXXXXXXX");
      const order = await Order.findById(req.params.id).select({
        products: 1,
        _id: 1,
        customer: 1,
      });

      if (req.body.status === "canceled" && req.body.addToStock === true) {
        const products = order.products;

        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const productInDb = await Product.findById(product.product);
          productInDb.stock += product.quantity;
          await productInDb.save();
        }

        if (order?.customer) {
          await Notification.create({
            receiver: order.customer,
            type: "order",
            content: {
              order: order._id,
              message:
                "Unfortunately, your order has been canceled. We are sorry for the inconvenience.",
            },
          });
        }
      }

      // const order = await Order.findById(req.params.id)
      if (req.body.status === "processing") {
        const products = order.products;

        for (let i = 0; i < products.length; i++) {
          const product = products[i];
          const productInDb = await Product.findById(product.product);
          productInDb.stock -= product.quantity;
          await productInDb.save();
        }

        if (order?.customer) {
          await Notification.create({
            receiver: order.customer,
            type: "order",
            content: {
              order: order._id,
              message: "Your order is now being processed.",
            },
          });
        }
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );
      res.status(200).json(updatedOrder);

      // const product = await Product.findById(req.params.id);

      // if (
      //   [...product.managers.toString(), product.owner.toString()].includes(
      //     req.user._id.toString()
      //   )
      // ) {
      //   const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      //     $upsert: true,
      //   });
      //   res.status(200).json(product);
      // } else {
      //   res.status(401).send({
      //     message: "You are not an authorized owner or manager of this product.",
      //   });
      // }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Order does not exist." });
    }
  })
  .delete("/:id", async (req, res) => {
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
