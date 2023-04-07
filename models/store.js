const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const addressSchema = new Schema({
  label: String,
  isPrimary: Boolean,
  addressBook: { type: ObjectId, ref: "AddressBook", required: true },
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
