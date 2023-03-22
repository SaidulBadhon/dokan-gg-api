const express = require("express");
const mongoose = require("mongoose");

const route = express.Router();

const User = require("../../models/user");
const Notification = require("../models/notification");
const Connection = require("../models/connection");

route
  .get("/", async (req, res) => {
    try {
      const users = await User.find();

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/find", async (req, res) => {
    const { sort = "", range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { search } = JSON.parse(filter);

    let myFriends = [];
    const myConnections = await Connection.find({
      "participants.user": mongoose.Types.ObjectId(req.user._id),
    });
    console.log();

    myConnections?.map((con) => {
      con?.participants?.map((per) => {
        if (per?._id?.toString() !== req.user._id?.toString()) {
          //   console.log("XXXXXXX --- id", per?._id);
          // } else {
          myFriends?.push(per?._id);
        }
      });
    });

    console.log(
      myFriends,
      req.user._id,
      myFriends?.map((con) => mongoose.Types.ObjectId(con))
    );

    const filterExp = (search && {
      $and: [
        {
          _id: {
            $nin: [
              // ...req?.user.connections?.map((con) => mongoose.Types.ObjectId(con)),
              ...myFriends,
              req?.user?._id,
            ],
          },
        },
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }) || {
      _id: {
        $nin: [
          // ...req?.user.connections?.map((con) => mongoose.Types.ObjectId(con)),
          ...myFriends,
          req?.user?._id,
        ],
      },
    };

    try {
      const users = await User.find(filterExp)
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .populate("avatar")
        .populate("coverArt")
        .sort(sort);

      users?.map((user) => {
        let avatar = user?.avatar;
        let coverArt = user?.coverArt;

        if (avatar) {
          avatar["thumbnail"] =
            process.env.IMAGE_HANDLER_URL +
            `/fit-in/${req.query.height || 500}x${
              req.query.width || 500
            }/public/` +
            avatar?.key;
        }

        if (coverArt) {
          coverArt["thumbnail"] =
            process.env.IMAGE_HANDLER_URL +
            `/fit-in/${req.query.height || 500}x${
              req.query.width || 500
            }/public/` +
            coverArt?.key;
        }
      });

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/users/:userId", async (req, res) => {
    try {
      const connections = await Connection.find({
        "participants.user": mongoose.Types.ObjectId(req.params.userId),
      })
        .populate({
          path: "participants.user",
          select: ["fullName", "avatar", "isActive", "email"],
          populate: { path: "avatar" },
        })
        .populate({
          path: "matchedBy",
          select: ["fullName", "avatar", "isActive", "email"],
        });

      let friends = [];
      let pending = [];

      connections?.map((con) => {
        if (con.participants.every((item) => item.accepted)) {
          friends.push(con);
        } else {
          pending.push(con);
        }
      });

      res.status(200).json({ friends, pending });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/users/:userId/request", async (req, res) => {
    try {
      const connections = await Connection.find({
        "participants.user": mongoose.Types.ObjectId(req.params.userId),
        "participants.accepted": true,
      })
        .populate({
          path: "participants.user",
          select: ["fullName", "avatar", "isActive", "email"],
          populate: { path: "avatar" },
        })
        .populate({
          path: "matchedBy",
          select: ["fullName", "avatar", "isActive", "email"],
        });

      let filteredConnection = [];

      connections?.map((con) => {
        con?.participants.filter((par) => {
          if (par?._id.toString() === req.params.userId) {
            if (par?.accepted === false) {
              filteredConnection.push(con);
            }
          }
        });
      });

      console.log(
        "filteredConnection : ",
        filteredConnection.length,
        " connections : ",
        JSON.stringify(connections, null, 4)
      );

      res.status(200).json(filteredConnection);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/add", async (req, res) => {
    try {
      const { user1Id, user2Id } = req.body;

      const connections = await Connection.find({
        "participants.user": {
          $all: [
            mongoose.Types.ObjectId(user1Id),
            mongoose.Types.ObjectId(user2Id),
          ],
        },
      });

      if (connections.length > 0) {
        console.log("Has User : True", connections);
        return res.status(200).json({ ...connections, hasUser: true });
      } else {
        const { user1Id, user2Id } = req.body;

        const connection = await Connection.create({
          participants: [
            {
              _id: mongoose.Types.ObjectId(user1Id),
              user: mongoose.Types.ObjectId(user1Id),
              accepted: user1Id === req.user._id.toString() ? true : false,
            },
            {
              _id: mongoose.Types.ObjectId(user2Id),
              user: mongoose.Types.ObjectId(user2Id),
              accepted: user2Id === req.user._id.toString() ? true : false,
            },
          ],
          matchedBy: req.user._id,
        });

        console.log("===============> ", connection);

        let notification = {
          sender: user1Id,
          receiver: mongoose.Types.ObjectId(user2Id),
          connection: connection?._id,
          type: "connection",
        };

        console.log("================           notification : ", notification);

        await Notification.create(notification);

        return res.status(200).json(connection);
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  })
  .post("/:connectionId/:userId/accept", async (req, res) => {
    try {
      // req.body.files

      let connection = await Connection.findById(req.params.connectionId);
      // console.log("connection 1 : ", connection, req.params.connectionId);

      connection.participants.filter(async (par, index) => {
        if (par._id.toString() === req.params.userId.toString()) {
          connection.participants[index].accepted = true;
        } else {
          let notification = {
            receiver: mongoose.Types.ObjectId(
              connection.participants[index]._id
            ),
            sender: req.user._id,
            content: {
              connection: connection?._id,
            },
            type: "connectionAccept",
          };

          await Notification.create(notification);
        }

        const dataToDelete = await Notification.findOneAndDelete({
          type: "connection",
          sender: { $in: [connection.participants[index]._id, req.user._id] },
          receiver: { $in: [connection.participants[index]._id, req.user._id] },
        });

        console.log("DDDDDDDDDDDDDDDDD > dataToDelete > ", dataToDelete);
      });

      // console.log(
      //   "XXXXXXXXXXXXXXXX ========= ",
      //   connection.participants.filter(
      //     (par) => par._id.toString() === req.params.userId.toString()
      //   ).accepted
      // );

      console.log("connection 2 : ", connection);

      await Connection.findByIdAndUpdate(req.params.connectionId, connection);

      res.json(connection);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .post("/:connectionId/remove", async (req, res) => {
    try {
      const connection = await Connection.findByIdAndDelete(
        req.params.connectionId
      );

      await Notification.deleteOne({
        type: "connection",
        sender: {
          $in: [
            connection?.participants[0]?._id,
            connection?.participants[1]?._id,
          ],
        },
        receiver: {
          $in: [
            connection?.participants[0]?._id,
            connection?.participants[1]?._id,
          ],
        },
      });
      await Notification.deleteOne({
        type: "connectionAccept",
        sender: {
          $in: [
            connection?.participants[0]?._id,
            connection?.participants[1]?._id,
          ],
        },
        receiver: {
          $in: [
            connection?.participants[0]?._id,
            connection?.participants[1]?._id,
          ],
        },
      });

      res.json(connection);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .put("/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { $upsert: true }
    );

    res.status(200).json(user);
  })
  .delete("/:id", async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

/*
route
  .get("/", async (req, res) => {
    try {
      const users = await User.find();

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/find", async (req, res) => {
    const { sort = "", range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { search, createdBy } = JSON.parse(filter);

    const filterExp = (search && {
      $and: [
        {
          _id: {
            $nin: [
              ...req?.user.connections?.map((con) =>
                mongoose.Types.ObjectId(con)
              ),
              req?.user?._id,
            ],
          },
        },
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }) || {
      _id: {
        $nin: [
          ...req?.user.connections?.map((con) => mongoose.Types.ObjectId(con)),
          req?.user?._id,
        ],
      },
    };

    // console.log("==>", filterExp);

    try {
      const users = await User.find(filterExp)
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(users);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id)
        .populate({
          path: "connections",
          select: {
            password: 0,
            resetPasswordToken: 0,
            resetPasswordExpires: 0,
            connections: 0,
          },
        })
        .select({
          password: 0,
          resetPasswordToken: 0,
          resetPasswordExpires: 0,
        });

      res.status(200).json(user?.connections);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/add", async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { connections: mongoose.Types.ObjectId(req.body?.id) },
      });

      let notification = {
        sender: req.user?._id,
        receiver: mongoose.Types.ObjectId(req.body?.id),
        type: "connection",
      };
      // content: {
      //   shareId: share._id,
      //   senderId: req.user?._id,
      //   album: req.body.album,
      //   files: req.body.files,
      // },

      await Notification.create(notification);

      res.json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .post("/remove", async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.user._id, {
        $pull: { connections: mongoose.Types.ObjectId(req.body?.id) },
      });

      res.json(user);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .put("/:id", async (req, res) => {
    const user = await User.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { $upsert: true }
    );

    res.status(200).json(user);
  })
  .delete("/:id", async (req, res) => {
    await User.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });
*/

module.exports = route;
