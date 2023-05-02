const { Schema, model } = require("mongoose");
const ratingSchema = require("./_components/rating");
const viewSchema = require("./_components/view");
const { ObjectId, Mixed } = Schema.Types;

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
    searchTags: [String],

    store: { type: ObjectId, ref: "Store", required: true },

    category: {
      primary: { type: ObjectId, ref: "Category" },
      secondary: { type: ObjectId, ref: "Category" },
      tertiary: { type: ObjectId, ref: "Category" },
    },
    brand: { type: ObjectId, ref: "Brand", required: false },
    model: String,

    price: { type: Number, required: true },
    previousPrices: [previousPricesSchema],

    shortDescription: { type: String, required: false },
    description: { type: String, required: true },
    specifications: { type: Mixed },

    shippingTime: Number,
    shippingCost: Number,

    cashOnDelivery: Boolean,

    warranty: Number,
    maxReturnTime: Number,

    images: [String],
    colors: [colorSchema],

    stock: { type: Number, required: true, default: 10 },
    condition: {
      type: String,
      enum: ["new", "likeNew", "used", "refurbished"],
      default: "new",
    },

    // Status - Start
    status: {
      type: String,
      enum: ["active", "pending", "reviewing", "onHold", "inactive"],
      default: "pending",
    },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    // Status - End

    views: viewSchema,
    rating: ratingSchema,

    createdBy: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);
