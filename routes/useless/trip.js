const axios = require("axios");
const express = require("express");
const route = express.Router();
const mongoose = require("mongoose");

const Trip = require("../models/trip");

route
  .get("/", async (req, res) => {
    try {
      const myTrips = await Trip.find({ createdBy: req.user._id })
        .populate({ path: "members.user", populate: { path: "avatar" } })
        .sort({ createdAt: -1 });

      // createdBy: { $ne: req.user._id },

      const otherTrips = await Trip.find({
        "members.user": mongoose.Types.ObjectId(req.user._id),
        createdBy: { $exists: true, $nin: [req.user._id] },
      }).populate({ path: "members.user", populate: { path: "avatar" } });

      // .populate({ path: "members.user", populate: { path: "avatar" } })
      // .sort({ createdAt: -1 });

      console.log(otherTrips, typeof req.user._id);

      return res.status(200).json({ myTrips, otherTrips });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/image/:placeId", async (req, res) => {
    try {
      axios
        .get(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${req.params.placeId}&key=AIzaSyDs341mLv1wYLiBcd0bbYp3SP4p4dvVG7M&fields=photo`
        )
        .then((response) => {
          res
            .status(200)
            .json(response?.data?.result?.photos[0]?.photo_reference);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send(err);
        });
    } catch (err) {
      res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate({
      path: "members.user",
      populate: { path: "avatar" },
    });

    res.status(200).json(trip);
  })
  .post("/", async (req, res) => {
    try {
      let members = [
        ...req.body.members,
        { user: req.user?._id, accepted: true, status: "going" },
      ];

      const trip = await Trip.create({
        ...req.body,
        startDate: new Date(req.body?.startDate),
        endDate: new Date(req.body?.endDate),
        members: members,
        createdBy: req.user?._id,
      });

      res.status(200).json(trip);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .put("/:id", async (req, res) => {
    const user = await Trip.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { $upsert: true }
    );

    res.status(200).json(user);
  })
  .put("/:id/:userId/status", async (req, res) => {
    try {
      console.log("Req Body: ", req.body);

      let data = await Trip.findById(req.params.id);
      let trip = data;

      trip?.members?.map((member) => {
        if (member?.user == req.params?.userId) {
          // console.log("*(***********************WE FOUND LOVE");
          member["status"] = req.body?.status;
        }
      });

      // console.log("trip: ", trip);
      const updatedTrip = await Trip.findByIdAndUpdate(
        { _id: req.params.id },
        trip,
        { $upsert: true }
      );

      res.status(200).json(updatedTrip);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .delete("/:id", async (req, res) => {
    await Trip.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
