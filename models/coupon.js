const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },

    type: {
      type: String,
      enum: ["store", "platform"],
      default: "platform",
    },

    // for store
    store: { type: ObjectId, ref: "Store", required: false },

    discountType: {
      type: String,
      enum: ["flat", "percent"],
      default: "percent",
    },

    rate: { type: Number, max: 100 },
    amount: Number,

    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    createdBy: { type: ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", CouponSchema);
