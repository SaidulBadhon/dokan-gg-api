const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    logo: String,
    coverArt: String,

    website: String,
    description: String,

    phone: String,
    mobile: String,
    email: String,

    // Address fields
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    // End of address

    // Management
    managers: [{ type: ObjectId, ref: "User", required: true }],
    employees: [{ type: ObjectId, ref: "User", required: true }],
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

module.exports = mongoose.model("Store", StoreSchema);
