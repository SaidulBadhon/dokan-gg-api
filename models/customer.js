const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

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
  },
  { timestamps: true }
);

module.exports = model("Customer", CustomerSchema);
