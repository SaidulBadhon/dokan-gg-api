const { Schema, model } = require("mongoose");
const ratingSchema = require("./useful/rating");
const viewSchema = require("./useful/view");
const { ObjectId } = Schema.Types;

// const imageSchema = new Schema({
//   src: { type: String, required: true },
//   width: { type: String, required: false },
//   height: { type: String, required: false },
// });

const colorSchema = new Schema({
  imageIndex: { type: Number, required: true },
  colors: [String],
});

const previousPricesSchema = new Schema({
  price: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
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

    shortDescription: { type: String, required: false },
    description: { type: String, required: true },

    shippingTime: Number,
    shippingCost: Number,

    cashOnDelivery: Boolean,

    warranty: Number,
    maxReturnTime: Number,

    // images: [imageSchema],
    images: [String],
    colors: [colorSchema],

    inventory: { type: Number, required: true },
    condition: {
      type: String,
      enum: ["new", "likeNew", "used", "refurbished"],
      default: "new",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "active",
        "onHold",
        "inactive",
        "archive",
        "delete",
      ],
      default: "pending",
    },

    views: viewSchema,
    rating: ratingSchema,

    createdBy: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);
