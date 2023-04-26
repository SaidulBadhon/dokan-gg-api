const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: false },

    parentId: { type: String, required: false },
    icon: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
