const mongoose = require("mongoose");

const LocationTreeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },

    parentId: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LocationTree", LocationTreeSchema);
