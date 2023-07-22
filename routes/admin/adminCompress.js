const express = require("express");
const route = express.Router();
const tinify = require("tinify");
const CompresImage = require("../../models/_components/compresImage");

const Product = require("../../models/product");
const Store = require("../../models/store");

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

        if (key.endsWith(".svg")) {
          return console.log("svg");
        } else {
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
        }
      });

      return res.status(200).json({ message: "success" });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .post("/genarateThumbs", async (req, res) => {
    try {
      // console.log(req.body);
      const imagesToCompress = filterUrls(req.body);

      console.log(req.body?.length, imagesToCompress?.length, imagesToCompress);

      imagesToCompress?.map(async (item) => {
        const key = item?.key;
        console.log(key);

        if (key.endsWith(".svg")) {
          return console.log("svg");
        } else {
          let newPath;
          const lastSlashIndex = key?.lastIndexOf("/");
          const source = await tinify.fromUrl(process.env.TINIFY_S3_URL + key);

          const resized = source.resize({
            method: "fit",
            width: 300,
            height: 300,
          });

          // check if it has large word in the key
          if (key.includes("large")) {
            newPath = key.replace("large", "thumb");
          } else {
            newPath =
              key.slice(0, lastSlashIndex) +
              "/thumb" +
              key.slice(lastSlashIndex);
          }

          resized.store({
            service: "s3",
            aws_access_key_id: process.env.TINIFY_AWS_ACCESS_KEY_ID,
            aws_secret_access_key: process.env.TINIFY_AWS_SECRET_ACCESS_KEY,
            region: "ap-southeast-1",
            headers: {
              "Cache-Control": "public, max-age=31536000",
            },
            path: process.env.TINIFY_AWS_BUCKET + "/" + newPath,
          });

          // check if its a product image
          if (key.includes("products/")) {
            const product = await Product.findOneAndUpdate(
              {
                images: { $elemMatch: { large: key } },
              },
              {
                $set: {
                  "images.$.thumb": newPath,
                },
              }
            );
          } else if (key.includes("logo/")) {
            const store = await Store.findOneAndUpdate(
              {
                "logo.large": key,
              },
              {
                $set: {
                  "logo.thumb": newPath,
                },
              }
            );
          } else if (key.includes("coverArt/")) {
            const store = await Store.findOneAndUpdate(
              {
                "coverArt.large": key,
              },
              {
                $set: {
                  "coverArt.thumb": newPath,
                },
              }
            );
          }

          // await CompresImage.create({
          //   key: key,
          //   location: process.env.TINIFY_S3_URL + key,
          // });
        }
      });

      return res.status(200).json({ message: "success" });
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

module.exports = route;

function filterUrls(urls) {
  const keywords = ["coverArt/", "logo/", "products/"];
  const pattern = new RegExp(keywords.join("|"), "i"); // "i" for case insensitive

  return urls.filter((url) => pattern.test(url?.key));
}
