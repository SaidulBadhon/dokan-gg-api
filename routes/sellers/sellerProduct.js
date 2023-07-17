const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");
const slugify = require("../../utils/slugify");
const generateRandomString = require("../../utils/generateRandomString");
const updateObjectWithReplacement = require("../../utils/updateObjectWithReplacement");

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
      let newProduct;

      let product = await Product.findById(req.params.id).populate({
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

      if (["super", "admin"].includes(req.user.role)) {
        console.log("DX", req.body);
        // console.log(updateObjectWithReplacement(product, req.body));
        // newProduct = Object.assign({}, product, req.body);

        newProduct = { ...product.toObject(), ...req.body };

        // product.save();
      } else {
        // Start of unsupported actions
        if (req.body?.status?.length > 0)
          return next(new Error("You are not authorized."));

        if (req.body.isDeleted === false)
          return next(new Error("You are not authorized."));
        // End of unsupported actions

        product = await Product.findById(req.params.id);

        if (!product) return next(new Error("Product not found"));

        const store = await Store.findById(product.store);
        if (!store) return next(new Error("Product's sotre not found"));

        if (
          [...store.managers.toString(), store.owner.toString()].includes(
            req.user._id.toString()
          )
        ) {
          console.log("XD");
          // updateObjectWithReplacement(product, req.body);
          // newProduct = Object.assign({}, product, req.body);
          newProduct = { ...product.toObject(), ...req.body };

          // product.save();
        }
      }

      if (
        newProduct.price &&
        req.body.price &&
        newProduct.price !== req.body.price
      ) {
        newProduct["previousPrices"] = [
          ...newProduct.previousPrices,
          { price: newProduct.price, expiryDate: new Date() },
        ];
        newProduct.price = req.body.price;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        newProduct._id,
        newProduct,
        { new: true }
      );

      return res.status(200).json(updatedProduct);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Product does not exist." });
    }
  })
  .delete("/:id", async (req, res) => {
    await Product.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
