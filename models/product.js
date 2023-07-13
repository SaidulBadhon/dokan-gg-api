const { Schema, model } = require("mongoose");
const ratingSchema = require("./_components/rating");
const viewSchema = require("./_components/view");
const { ObjectId, Mixed } = Schema.Types;

const colorSchema = new Schema({
  imageIndex: { type: Number, required: true },
  // colors: [String],
  color: String,
});

const previousPricesSchema = new Schema({
  price: { type: Number, required: true },
  expiryDate: { type: Date, required: true },
});

const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    videoUrl: String,
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

    price: { type: Number, required: false }, // required: true
    previousPrices: [previousPricesSchema],

    shortDescription: { type: String, required: false },
    description: { type: String, required: false }, // required: true
    // specifications: { type: Mixed },

    specifications: [
      {
        key: String,
        value: String,
      },
    ],
    boxContent: { type: String },

    // Delivery - Start
    packageWeight: Number,
    dimension: {
      length: Number,
      width: Number,
      height: Number,
    },

    delivery: {
      deliveryProvider: {
        type: String,
        enum: ["personal", "redx", "pathao", "dokan.gg"],
      },
      isOutsideCityDeliveryEnabled: Boolean,
      insideCityDeliveryFee: Number,
      outsideCityDeliveryFee: Number,

      deliveryTime: Number,
    },

    maxReturnTime: Number,
    // Delivery - End

    warranty: Number,

    images: [String],
    colors: [colorSchema],

    stock: { type: Number, required: false, default: 10 }, // required: true
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
    isArchived: { type: Boolean, default: false, required: true },
    isDeleted: { type: Boolean, default: false, required: true },
    // Status - End

    views: viewSchema,
    rating: ratingSchema,

    createdBy: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = model("Product", ProductSchema);
