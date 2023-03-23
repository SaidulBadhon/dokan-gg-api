const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

// Canceled – Grey
// Completed – Blue
// Failed – Red
// On Hold – Orange
// Pending Payment – Grey
// Processing – Green
// Refunded – Grey

const productWithPriceSchema = new Schema({
  product: { type: ObjectId, ref: "Product", required: true },
  variant: { type: String, required: true },

  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customerId: { type: ObjectId, ref: "User", required: true },

    products: [productWithPriceSchema],

    total: { type: Number, required: true },

    coupon: { type: ObjectId, ref: "Coupon", required: true },
    paymentMethod: {
      type: String,
      enum: ["bank", "bkash", "rocket", "nogod", "other"],
      default: "other",
    },
    trxId: String,

    state: {
      type: String,
      enum: [
        "pendingPayment",
        "failed",

        "processing",
        "completed",

        "onHold",
        "canceled",

        "refunded",
      ],
      default: "pendingPayment",
    },
  },
  { timestamps: true }
);

module.exports = model("Order", OrderSchema);
