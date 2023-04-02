const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const StoreSchema = new Schema(
  {
    name: { type: String },
    slug: { type: String, unique: true },

    logo: String,
    coverArt: String,

    website: String,
    description: String,

    contactNumber: String,
    email: String,

    // Address fields
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
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
