const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const addressSchema = new Schema({
  label: String,
  isPrimary: Boolean,
  addressBook: { type: ObjectId, ref: "AddressBook", required: true },
});

const CustomerSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },

    birthday: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    defaultPaymentMethod: {
      type: String,
      enum: ["bank", "bkash", "rocket", "nogod", "other"],
      default: "other",
    },
    bkashNumber: String,
    rocketNumber: String,
    nogodNumber: String,

    // Address fields
    address: [addressSchema],
    // End of address
  },
  { timestamps: true }
);

module.exports = model("Customer", CustomerSchema);
