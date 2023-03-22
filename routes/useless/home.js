const express = require("express");

const route = express.Router();

const User = require("../../models/user");
const Album = require("../models/album");
const File = require("../../models/file");

route
  .get("/albums", async (req, res) => {
    try {
      const albums = await Album.find({ createdBy: req.user?._id })
        .populate("coverArt")
        .populate("files")
        .sort({ createdAt: -1 })
        .limit(6);

      albums.map((album) => {
        album?.files?.map((file) => {
          if (file?.type === "image") {
            file["thumbnail"] =
              process.env.IMAGE_HANDLER_URL +
              `/fit-in/${req.query.height || 500}x${
                req.query.width || 500
              }/public/` +
              file.key;
          }
        });

        let coverArt = album?.coverArt;

        if (coverArt) {
          coverArt["thumbnail"] =
            process.env.IMAGE_HANDLER_URL +
            `/fit-in/${req.query.height || 500}x${
              req.query.width || 500
            }/public/` +
            coverArt?.key;
        }
      });

      return res.status(200).json(albums);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/files/:type", async (req, res) => {
    try {
      const files = await File.find({
        createdBy: req.user?._id,
        type: req.params.type,
      })
        .sort({ createdAt: -1 })
        .limit(14);

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

      res.status(200).json(files);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  })
  .get("/search", async (req, res) => {
    const { sort = "", range = "", filter = "{}" } = req.query;
    const rangeExp = range && JSON.parse(range);

    const { search } = JSON.parse(filter);
    const createdBy = req.user._id;

    const usersFilterExp = (search && {
      $and: [
        {
          _id: {
            $nin: [req?.user?._id],
          },
        },
        {
          fullName: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }) || { ...(createdBy && { createdBy }) };

    const albumsFilterExp = (search && {
      $and: [
        { createdBy },
        {
          $or: [
            {
              name: {
                $regex: search,
                $options: "i",
              },
            },
            {
              address: {
                $regex: search,
                $options: "i",
              },
            },
          ],
        },
      ],
    }) || { ...(createdBy && { createdBy }) };

    const filesilterExp = (search && {
      $and: [
        { createdBy },
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    }) || { ...(createdBy && { createdBy }) };

    const users = await User.find(usersFilterExp)
      .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
      .skip(rangeExp.length && rangeExp[0])
      .sort(sort);

    const albums = await Album.find(albumsFilterExp)
      .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
      .skip(rangeExp.length && rangeExp[0])
      .sort(sort)
      .populate("coverArt")
      .populate("files");
    albums.map((album) => {
      album?.files?.map((file) => {
        if (file?.type === "image") {
          file["thumbnail"] =
            process.env.IMAGE_HANDLER_URL +
            `/fit-in/${req.query.height || 500}x${
              req.query.width || 500
            }/public/` +
            file.key;
        }
      });

      let coverArt = album?.coverArt;

      if (coverArt) {
        coverArt["thumbnail"] =
          process.env.IMAGE_HANDLER_URL +
          `/fit-in/${req.query.height || 500}x${
            req.query.width || 500
          }/public/` +
          coverArt?.key;
      }
    });

    const files = await File.find(filesilterExp)
      .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
      .skip(rangeExp.length && rangeExp[0])
      .sort(sort);

    const images = [];
    const videos = [];

    files.length > 0 &&
      files?.map((file) => {
        if (file?.type === "image") {
          images.push(file);
        } else {
          videos.push(file);
        }
      });

    images?.map((img) => {
      img["thumbnail"] =
        process.env.IMAGE_HANDLER_URL +
        `/fit-in/${req.query.height || 500}x${req.query.width || 500}/public/` +
        img?.key;
    });
    // videos?.map((vid) => {
    //   vid["thumbnail"] =
    //     process.env.IMAGE_HANDLER_URL +
    //     `/fit-in/${req.query.height || 500}x${req.query.width || 500}/public/` +
    //     vid?.key;
    // });

    return res.status(200).json({ users, albums, images, videos });
  });

module.exports = route;
