const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;
const ratingSchema = require("./_components/rating");
const paymentOption = require("./_components/paymentOption");
const AddressBookSchema = require("./_components/addressBook");

const socialLinkSchema = new Schema({
  facebook: { type: String, required: false },
  instagram: { type: String, required: false },
  whatsApp: { type: String, required: false },
  twitter: { type: String, required: false },
  tiktok: { type: String, required: false },
  linkedin: { type: String, required: false },
  website: { type: String, required: false },
});

const sectionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  products: [{ type: ObjectId, ref: "Product", required: false }],
});

const StoreSchema = new Schema(
  {
    name: { type: String },
    slug: { type: String, unique: true },

    logo: String,
    coverArt: String,

    description: String,

    number: String,
    email: String,

    // Address - Start
    address: AddressBookSchema,
    delivery: {
      deliveryProvider: {
        type: String,
        enum: ["personal", "redx", "pathao", "dokan.gg"],
        default: "personal",
      },
      isOutsideCityDeliveryEnabled: { type: Boolean, default: true },
      insideCityDeliveryFee: { type: Number, default: 75 },
      outsideCityDeliveryFee: { type: Number, default: 150 },
    },
    // Address - End

    // Management - Start
    owner: { type: ObjectId, ref: "User", required: true },
    managers: [{ type: ObjectId, ref: "User" }],
    employees: [{ type: ObjectId, ref: "User" }],
    // Management - End

    type: {
      type: String,
      enum: [
        "physical",
        "facebook",
        "instagram",
        "whatsApp",
        "twitter",
        "tiktok",
        "website",
        "others",
      ],
      default: "facebook",
    },
    socialLinks: socialLinkSchema,

    // Status - Start
    status: {
      type: String,
      enum: ["active", "pending", "reviewing", "onHold", "deactivate"],
      default: "pending",
    },
    readyForReview: { type: Boolean, default: false, required: true },

    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    isFeatured: { type: Boolean, default: false },
    isTopRated: { type: Boolean, default: false },
    // Status - End

    // Payment - Start
    paymentOptions: paymentOption,
    // Payment - End

    // Template - Start

    sections: [sectionSchema],
    selectedTemplate: { type: String, default: "tamplate2" },
    // Template - End

    viewCount: { type: Number, default: 0 },
    rating: ratingSchema,
  },
  { timestamps: true }
);

module.exports = model("Store", StoreSchema);
