const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  src: { type: String, required: true },
  width: { type: String, required: true },
  height: { type: String, required: true },
});

const colorSchema = new mongoose.Schema({
  imageId: { type: imageSchema, required: true },
  colors: [String],
});

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    price: { type: Number, required: true },
    delivery: { type: String, required: false },
    delivery: { type: String, required: true },

    shortDescription: { type: String, required: true },
    description: { type: String, required: true },

    category: { type: ObjectId, ref: "Category" },

    images: [imageSchema],
    colors: [colorSchema],

    // rating: {
    //  count: 500,
    //  rate: 4.7
    // }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", StoreSchema);
