const { model, Schema } = require("mongoose");
const { ObjectId } = Schema.Types;

const CouponSchema = new Schema(
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

module.exports = model("Coupon", CouponSchema);
