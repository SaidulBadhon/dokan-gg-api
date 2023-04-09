const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const addressSchema = new Schema({
  label: String,
  isPrimary: Boolean,
  addressBook: { type: ObjectId, ref: "AddressBook", required: true },
});

const socialLinkSchema = new Schema({
  facebook: { type: String, required: false },
  instagram: { type: String, required: false },
  whatsApp: { type: String, required: false },
  twitter: { type: String, required: false },
  tiktok: { type: String, required: false },
  linkedin: { type: String, required: false },
});

const StoreSchema = new Schema(
  {
    name: { type: String },
    slug: { type: String, unique: true },

    logo: String,
    coverArt: String,

    website: String,
    description: String,

    number: String,
    email: String,

    // Address fields
    address: [addressSchema],
    // End of address

    // Management
    owner: { type: ObjectId, ref: "User", required: true },
    managers: [{ type: ObjectId, ref: "User" }],
    employees: [{ type: ObjectId, ref: "User" }],
    // End of management

    type: {
      type: String,
      enum: ["physical", "facebook", "website", "tiktok", "others"],
      default: "facebook",
    },
    socialLinks: socialLinkSchema,

    state: {
      type: String,
      enum: ["pending", "reviewing", "active", "onHold", "inactive", "delete"],
      default: "pending",
    },

    // rating: {
    //  count: 500,
    //  rate: 4.7
    // }
  },
  { timestamps: true }
);

module.exports = model("Store", StoreSchema);
