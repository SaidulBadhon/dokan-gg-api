const express = require("express");
const route = express.Router();
// const Facebook = require("facebook-node-sdk");

const Store = require("../../models/store");
const Product = require("../../models/product");
const Notification = require("../../models/notification");

const slugify = require("../../utils/slugify");
const generateRandomString = require("../../utils/generateRandomString");

route
  .get("/", async (req, res) => {
    try {
      const { range = "", filter = "{}" } = req.query;
      const rangeExp = range && JSON.parse(range);

      const { search, status, isArchived, isDeleted } = JSON.parse(filter);

      const stores = await Store.find({
        $or: [
          { owner: req?.user?._id },
          { managers: [req?.user?._id] },
          { employees: [req?.user?._id] },
        ],
      }).select("_id");

      let statusFilterQuery = status ? { status } : {};
      let isArchivedFilterQuery = isDeleted
        ? {}
        : isArchived
        ? { isArchived }
        : { isArchived: false };
      let isDeletedFilterQuery = { isDeleted: isDeleted ? true : false };

      const filterQuery = ["super", "admin"].includes(req.user.role)
        ? {
            $and: [
              statusFilterQuery,
              isArchivedFilterQuery,
              isDeletedFilterQuery,
              {
                $or: [
                  {
                    name: {
                      $regex: search,
                      $options: "i",
                    },
                  },
                  {
                    slug: {
                      $regex: search,
                      $options: "i",
                    },
                  },
                ],
              },
            ],
          }
        : {
            $and: [
              statusFilterQuery,
              isArchivedFilterQuery,
              isDeletedFilterQuery,
              {
                $or: [
                  {
                    name: {
                      $regex: search,
                      $options: "i",
                    },
                  },
                  {
                    slug: {
                      $regex: search,
                      $options: "i",
                    },
                  },
                ],
              },
              { store: { $in: stores?.map((s) => s?._id) } },
            ],
          };

      const products = await Product.find(filterQuery)
        .populate({
          path: "store",
          select: { logo: 1, name: 1, slug: 1 },
        })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await Product.countDocuments(filterQuery);

      return res.status(200).json({
        result: products,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      }).populate({
        path: "categories",

        populate: {
          path: "parent",
          populate: {
            path: "parent",
            populate: {
              path: "parent",
              populate: {
                path: "parent",
                populate: {
                  path: "parent",
                  populate: {
                    path: "parent",
                    populate: {
                      path: "parent",
                      populate: {
                        path: "parent",
                        populate: {
                          path: "parent",
                          populate: {
                            path: "parent",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
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
  .post("/:productId/share", async (req, res) => {
    try {
      const postData = {
        message: "This is a post created with Node.js!",
        link: "https://www.example.com",
      };

      const response = await graphAPI.post("me/feed", postData);

      facebook.api("/me/feed", function (err, data) {
        console.log(data); // => { id: ... }
      });

      res.status(200).send();
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a product" });
    }
  })
  .post("/:id/submitForReview", async (req, res) => {
    try {
      const product = await Product.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        { $set: { readyForReview: true } },
        { new: true }
      );

      if (!product) throw new Error("Product not found");

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
      ]);

      return res.status(200).json(product);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product does not exist." });
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
  .put("/:id", async (req, res, next) => {
    try {
      console.log(req.body);
      const product = await Product.findById(req.params.id);
      if (!product) return next(new Error("Product not found"));

      if (["super", "admin"].includes(req.user.role)) {
        // Check if price is being updated
        if (req.body.hasOwnProperty("price")) {
          const newPrice = req.body.price;
          const previousPrice = product.price;

          // Update the price and add previous price to previousPrices array
          product.price = newPrice;
          if (previousPrice && previousPrice !== newPrice) {
            if (!product.previousPrices) {
              product.previousPrices = [];
            }

            product.previousPrices.push({
              price: previousPrice,
              expiryDate: new Date(),
            });
          }
        }

        // Update other fields
        for (const key in req.body) {
          if (req.body.hasOwnProperty(key)) {
            product[key] = req.body[key];
          }
        }

        // Save the updated product
        await product.save();

        return res.status(200).json(product);
      } else {
        // Start of unsupported actions
        if (req.body?.status?.length > 0)
          return next(new Error("You are not authorized."));

        if (req.body.isDeleted === false)
          return next(new Error("You are not authorized."));
        // End of unsupported actions

        const store = await Store.findOne({
          _id: product.store,
          $or: [
            { owner: req.user?._id },
            { managers: req.user?._id },
            { employees: req.user?._id },
          ],
        }).select("_id");
        if (!store)
          return next(
            new Error("You don't have access to this product's store")
          );

        // Check if price is being updated
        if (req.body.hasOwnProperty("price")) {
          const newPrice = req.body.price;
          const previousPrice = product.price;

          if (!product.previousPrices) {
            product.previousPrices = [];
          }

          // Update the price and add previous price to previousPrices array
          product.price = newPrice;
          if (previousPrice && previousPrice !== newPrice) {
            if (!product.previousPrices) {
              product.previousPrices = [];
            }

            product.previousPrices.push({
              price: previousPrice,
              expiryDate: new Date(),
            });
          }
        }

        // Update other fields
        for (const key in req.body) {
          if (req.body.hasOwnProperty(key)) {
            product[key] = req.body[key];
          }
        }

        // Save the updated product
        await product.save();

        return res.status(200).json(product);
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Product does not exist." });
    }
  })
  .delete("/:id", async (req, res) => {
    if (["super", "admin"].includes(req.user.role)) {
      await Product.deleteOne({ _id: req.params.id });
      return res.status(200).json({ id: req.params.id });
    } else return res.status(401).send({ message: "You are not authorized." });
  });

module.exports = route;
