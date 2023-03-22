// const S3 = require("aws-sdk").S3;
const mongoose = require("mongoose");
const express = require("express");
const route = express.Router();
// const probe = require("probe-image-size");

const File = require("../models/file");
const Album = require("../models/album");
const User = require("../../models/user");

// const s3 = new S3({
//   accessKeyId: process.env.NODE_AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.NODE_AWS_SECRET_ACCESS_KEY,
//   region: process.env.NODE_AWS_REGION,
// });

route
  .get("/", async (req, res) => {
    try {
      const files = await File.find().sort({ createdAt: -1 });

      return res.status(200).json(files);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/mine/:type", async (req, res) => {
    try {
      const files = await File.find({
        createdBy: req.user?._id,
        type: req.params.type,
      });
      // .sort({ createdAt: -1 });

      files?.map((file) => {
        if (file?.type === "image") {
          file["thumbnail"] =
            process.env.IMAGE_HANDLER_URL +
            `/fit-in/${req.query.height || 500}x${
              req.query.width || 500
            }/public/` +
            file.key;
        }
      });

      let sharedWithMe = [];

      const usr = await User.findById(req.user?._id).populate("sharedWithMe");

      usr.sharedWithMe?.map((f) => {
        if (f.type === req.params.type) {
          if (f?.type === "image") {
            f["thumbnail"] =
              process.env.IMAGE_HANDLER_URL +
              `/fit-in/${req.query.height || 500}x${
                req.query.width || 500
              }/public/` +
              f.key;
          }
          const data = { ...f.toObject(), sharedWithMe: true };

          sharedWithMe.push(data);
        }
      });

      let newArray = [...files, ...sharedWithMe];

      // console.log(
      //   "********************",
      //   JSON.stringify(sharedWithMe, null, 4)
      // );

      newArray.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      res.status(200).json(newArray);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    const file = await File.findById(req.params.id)
      .populate("coverArt")
      .populate("files");

    file["thumbnail"] =
      process.env.IMAGE_HANDLER_URL +
      `/fit-in/${req.query.height || 500}x${req.query.width || 500}/public/` +
      file.key;

    res.status(200).json(file);
  })
  .post("/", async (req, res) => {
    try {
      const file = await File.create({ ...req.body, createdBy: req.user?._id });

      if (req.body.albumId) {
        await Album.findByIdAndUpdate(req.body?.albumId, {
          $addToSet: { files: file?._id },
        });
      }

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { usedStorage: file?.size },
      });

      res.status(200).json(file);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .post("/many", async (req, res) => {
    try {
      let data = [];

      req.body?.files?.map((item) => {
        data?.push({ ...item, createdBy: req.user?._id });
      });

      const files = await File.create(data);

      if (req.body.albumId) {
        await Album.findByIdAndUpdate(req.body?.albumId, {
          $addToSet: { files: files?.map((file) => file?._id) },
        });
      }

      const sizes = files?.map((f) => f?.size);

      let calc = sizes.reduce(
        (previousValue, currentValue) =>
          Number(previousValue) + Number(currentValue),
        0
      );

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { usedStorage: calc },
      });

      //

      // console.log("req.body : ", JSON.stringify(req.body, null, 4));
      // console.log("data : ", JSON.stringify(req.body, null, 4));

      res.status(200).json(files);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .put("/:id", async (req, res) => {
    const file = await File.findByIdAndUpdate(
      { _id: req.params.id },
      req.body,
      { $upsert: true }
    );

    res.status(200).json(file);
  })
  .delete("/:id", async (req, res) => {
    try {
      const fileToDelete = await File.findById(req.params.id);

      // const newUsedStorage = req.user.usedStorage

      await User.findByIdAndUpdate(req.user._id, {
        $inc: { usedStorage: -fileToDelete?.size },
      });

      await File.deleteOne({ _id: req.params.id });

      res.status(200).send(file);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  });
// .post("/delete", async (req, res) => {
//   try {
//     const data = [];
//     req.body.map((id) => data.push(mongoose.Types.ObjectId(id)));
//     const filesToDelete = await File.find({
//       _id: { $in: data },
//     });

//     // console.log("filesToDelete : ", filesToDelete);

//     let objects = [];
//     filesToDelete?.map((f) => {
//       objects.push({ Key: f?.key });
//     });

//     // console.log("objects : ", objects);

//     var deleteParam = {
//       Bucket: process.env.NODE_AWS_BUCKET,
//       Delete: {
//         Objects: objects,
//       },
//     };
//     s3.deleteObjects(deleteParam, async (err, data) => {
//       if (err) {
//         console.log(err, err.stack);
//         res.status(500).send(err);
//       } else {
//         // console.log("deleteParam", deleteParam?.Delete?.Objects);

//         // console.log(
//         //   "deleteParam?.Delete?.Objects?.map((f) => f?.Key) :",
//         //   deleteParam?.Delete?.Objects?.map((f) => f?.Key)
//         // );

//         await File.deleteMany({
//           key: { $in: deleteParam?.Delete?.Objects?.map((f) => f?.Key) },
//         });

//         res.status(200).json({ msg: "Files deleted successfully" });
//         // console.log("res", res);
//       }
//     });

//     // res.status(200).json({ id: req.params.id });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// });

module.exports = route;
