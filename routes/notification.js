const express = require("express");
const route = express.Router();

const Notification = require("../models/notification");

route
  .get("/", async (req, res) => {
    try {
      const filter = ["super", "admin"].includes(req.user.role)
        ? {
            $or: [{ receiverRole: req.user.role }, { receiver: req.user._id }],
          }
        : {
            receiver: req.user._id,
          };

      let notifications = await Notification.find(filter)
        .populate({
          path: "sender",
          select: {
            firstName: 1,
            lastName: 1,
            avatar: 1,
          },
        })
        .sort({ createdAt: -1 })
        .limit(parseInt(req.query?.limit || 10));

      console.log(notifications);

      return res.status(200).json(notifications);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/all", async (req, res) => {
    try {
      const notifications = await Notification.find({ receiver: req.user._id })
        .populate({
          path: "sender",
          select: {
            fullName: 1,
            userName: 1,
            avatar: 1,
          },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json(notifications);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/", async (req, res) => {
    try {
      const notification = await Notification.updateMany(
        {
          _id: { $in: req.body.ids },
        },
        { $set: { seen: true } },
        { multi: true }
      );

      return res.status(200).json(notification);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

module.exports = route;
