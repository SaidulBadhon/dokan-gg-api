const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;
const ratingSchema = require("./_components/rating");
const viewSchema = require("./_components/view");
const paymentOption = require("./_components/paymentOption");

// const addressSchema = new Schema({
//   label: String,
//   isPrimary: Boolean,
//   addressBook: AddressBookSchema,
// });

const socialLinkSchema = new Schema({
  facebook: { type: String, required: false },
  instagram: { type: String, required: false },
  whatsApp: { type: String, required: false },
  twitter: { type: String, required: false },
  tiktok: { type: String, required: false },
  linkedin: { type: String, required: false },
  website: { type: String, required: false },
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
    address: { type: ObjectId, ref: "AddressBook", required: false },
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
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    // Status - End

    // Payment - Start
    paymentOptions: paymentOption,
    // Payment - End

    views: viewSchema,
    rating: ratingSchema,
  },
  { timestamps: true }
);

module.exports = model("Store", StoreSchema);
