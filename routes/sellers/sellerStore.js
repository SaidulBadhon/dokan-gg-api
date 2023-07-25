const express = require("express");
const route = express.Router();

const Store = require("../../models/store");
const Product = require("../../models/product");

const generateRandomString = require("../../utils/generateRandomString");
const slugify = require("../../utils/slugify");
const notification = require("../../models/notification");

route
  .get("/", async (req, res) => {
    try {
      const { range = "", filter = "{}" } = req.query;
      const rangeExp = range && JSON.parse(range);

      const { search, status, isArchived, isDeleted } = JSON.parse(filter);

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
                    title: {
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
                  { owner: req?.user?._id },
                  { managers: [req?.user?._id] },
                  { employees: [req?.user?._id] },
                ],
              },
              {
                $or: [
                  {
                    title: {
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
          };

      const stores = await Store.find(filterQuery)
        .select({ name: 1, slug: 1, logo: 1, type: 1, owner: 1, status: 1 })
        .populate({
          path: "owner",
          select: { avatar: 1, firstName: 1, lastName: 1, email: 1 },
        })
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort({ createdAt: -1 });

      const countDocuments = await Store.countDocuments(filterQuery);

      return res.status(200).json({
        result: stores,
        count: countDocuments,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Faild to load stores." });
    }
  })
  .get("/checkSlug/:slug", async (req, res) => {
    const store = await Store.findOne({ slug: req.params.slug }).select({
      slug: 1,
      _id: 1,
    });

    if (store) return res.status(200).json(store);
    else return res.status(200).json({ message: "Store does not exist." });
  })
  .get("/:id", async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Store does not exist." });
    }
  })
  .get("/:id/products/names", async (req, res) => {
    try {
      const products = await Product.find({
        $and: [
          { status: "active" },
          { isArchived: false },
          { isDeleted: false },
          { store: req.params.id },
        ],
      }).select({
        name: 1,
        slug: 1,
        _id: 1,
        images: 1,
      });

      return res.status(200).json(products);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Product profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      const store = await Store.create({
        ...req.body,
        slug:
          req.body?.slug || slugify(req.body.name) + generateRandomString(4),
        owner: req?.user?._id,
      });

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Fail to create a store" });
    }
  })
  .post("/:id/submitForReview", async (req, res) => {
    try {
      const store = await Store.findOneAndUpdate(
        {
          _id: req.params.id,
          readyForReview: false,
        },
        { $set: { readyForReview: true } },
        { new: true }
      );

      if (!store) throw new Error("Store not found");

      await Notification.insertMany([
        {
          sender: req.user._id,
          receiverRole: "super",
          type: "store",
          content: {
            storeId: store._id,
            message: `${store?.name} submitted for review`,
          },
        },
        {
          sender: req.user._id,
          receiverRole: "admin",
          type: "store",
          content: {
            storeId: store._id,
            message: `${store?.name} submitted for review`,
          },
        },
      ]);

      return res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Store does not exist." });
    }
  })
  .put("/", async (req, res) => {
    const store = await Store.findByIdAndUpdate(
      { _id: req.store._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(store);
  })
  .put("/:id", async (req, res, next) => {
    try {
      let store;

      if (["super", "admin"].includes(req.user.role)) {
        store = await Store.findByIdAndUpdate(req.params.id, req.body, {
          $upsert: true,
          new: true,
        });
      } else {
        // Start of unsupported actions
        if (req.body?.status?.length > 0)
          return next(new Error("You are not authorized."));

        if (req.body.isDeleted === false)
          return next(new Error("You are not authorized."));
        // End of unsupported actions

        store = await Store.findById(req.params.id);
        if (!store) return next(new Error("Store not found"));

        // const store = await Store.findById(store.store);
        // if (!store) return next(new Error("Store's sotre not found"));

        if (
          [...store.managers.toString(), store.owner.toString()].includes(
            req.user._id.toString()
          )
        ) {
          store = await Store.findByIdAndUpdate(req.params.id, req.body, {
            $upsert: true,
            new: true,
          });
        } else {
          return next(
            new Error(
              "You are not an authorized owner or manager of this store."
            )
          );
        }
      }

      res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Store does not exist." });
    }
  })
  .put(`/:id/sections`, async (req, res) => {
    try {
      console.log(req.body);

      const store = await Store.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            sections: req.body,
          },
        },
        { new: true }
      );

      res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Store does not exist." });
    }
  })
  .put(`/:id/sections/:sectionId`, async (req, res) => {
    try {
      const store = await Store.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            "sections.$[section]": req.body,
          },
        },
        {
          arrayFilters: [{ "section._id": req.params.sectionId }],
          new: true,
        }
      );

      res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Store does not exist." });
    }
  })
  .put(`/:id/sections/:sectionId/move`, async (req, res) => {
    try {
      const { fromIndex, toIndex } = req.body;

      const store = await Store.findByIdAndUpdate(
        req.params.id,
        {
          $splice: { sections: [{ $size: fromIndex }, 1] },
          $splice: { sections: [{ $size: toIndex }, 0, sectionToMove] },
        },
        { new: true }
      );

      res.status(200).json(store);
    } catch (err) {
      console.log(err);
      res.status(500).send({ message: "Store does not exist." });
    }
  })
  .delete("/:id", async (req, res) => {
    if (["super", "admin"].includes(req.user.role)) {
      await Store.deleteOne({ _id: req.params.id });
      return res.status(200).json({ id: req.params.id });
    } else return res.status(500).send({ message: "You are not authorized." });
  });

module.exports = route;
