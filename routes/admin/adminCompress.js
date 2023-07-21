const express = require("express");
const route = express.Router();
const tinify = require("tinify");
const CompresImage = require("../../models/_components/compresImage");

tinify.key = process.env.TINIFY_KEY;

route
  .get("/", async (req, res) => {
    try {
      const compresImage = await CompresImage.find();

      return res.status(200).json(compresImage);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/", async (req, res) => {
    try {
      req.body?.map(async (key) => {
        console.log(key);
        const source = await tinify.fromUrl(process.env.TINIFY_S3_URL + key);

        await source.store({
          service: "s3",
          aws_access_key_id: process.env.TINIFY_AWS_ACCESS_KEY_ID,
          aws_secret_access_key: process.env.TINIFY_AWS_SECRET_ACCESS_KEY,
          region: "ap-southeast-1",
          headers: {
            "Cache-Control": "public, max-age=31536000",
          },
          path: process.env.TINIFY_AWS_BUCKET + "/" + key,
        });

        await CompresImage.create({
          key: key,
          location: process.env.TINIFY_S3_URL + key,
        });
      });

      return res.status(200).json({ message: "success" });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

module.exports = route;
