const express = require("express");
const route = express.Router();

const View = require("../../models/view");
const Product = require("../../models/product");
const Store = require("../../models/store");

route.post(`/`, async (req, res) => {
  try {
    const { type, id, viewer, referer } = req.body;

    // Get the IP address from the request
    const ip = req.ip; // or req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // // Get the Referer from the request headers
    // const referer = req.headers.referer || "";

    // Check if a View object exists for the given product or store today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let view = await View.findOne({
      type,
      $or: [{ product: id }, { store: id }],
      createdAt: { $gte: today },
    });

    if (!view) {
      // If no view object exists, create a new one
      view = new View({
        type,
        [type]: id,
        viewers: [],
      });
    }

    // Update the count and add the viewer details
    view.count += 1;
    if (viewer || ip || referer) {
      view.viewers.push({
        viewer,
        ip,
        referer,
      });
    }

    // Save the updated or new View object
    await view.save();

    // Add +1 to the product or store view count
    if (type === "product") {
      await Product.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    } else if (type === "store") {
      await Store.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the view." });
  }
});

module.exports = route;
