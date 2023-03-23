const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const imageSchema = new Schema({
  src: { type: String, required: true },
  width: { type: String, required: true },
  height: { type: String, required: true },
});

const colorSchema = new Schema({
  imageId: { type: imageSchema, required: true },
  colors: [String],
});

const previousPricesSchema = new Schema({
  price: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
});

const viewCountSchema = new Schema({
  count: { Number },
  user: { type: ObjectId, ref: "Category" },
  date: { type: Date, required: true },
  ip: String,
  source: String,
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    store: { type: ObjectId, ref: "Store", required: true },

    type: String,
    brand: String,
    model: String,

    category: { type: ObjectId, ref: "Category" },

    price: { type: Number, required: true },
    previousPrices: [previousPricesSchema],

    shortDescription: { type: String, required: true },
    description: { type: String, required: true },

    shippingTime: Number,
    shippingCost: Number,

    cashOnDelivery: Boolean,

    warranty: Number,
    maxReturnTime: Number,

    images: [imageSchema],
    colors: [colorSchema],

    inventory: { type: Number, required: true },
    condition: {
      type: String,
      enum: ["new", "likeNew", "used", "refurbished"],
      default: "new",
    },

    views: [viewCountSchema],

    // rating: {
    //  count: 500,
    //  rate: 4.7
    // }
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);
