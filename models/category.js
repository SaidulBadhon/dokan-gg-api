const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: false, unique: true },
    localId: { type: String, required: false },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: false,
    },
    icon: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", CategorySchema);
