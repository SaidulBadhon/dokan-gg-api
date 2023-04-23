const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const { AddressBookSchema } = require("./addressBook");

// Canceled – Grey
// Completed – Blue
// Failed – Red
// On Hold – Orange
// Pending Payment – Grey
// Processing – Green
// Refunded – Grey

const productWithPriceSchema = new Schema({
  product: { type: ObjectId, ref: "Product", required: true },
  variant: { type: String, default: "default" },

  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: ObjectId, ref: "User", required: true },
    deliveryAddress: { AddressBookSchema },
    deliveryDate: Date,

    products: [productWithPriceSchema],

    total: { type: Number, required: true },

    coupon: { type: ObjectId, ref: "Coupon", required: false },
    paymentMethod: {
      type: String,
      enum: ["bank", "bkash", "rocket", "nogod", "cashOnDelivery", "other"],
      default: "cashOnDelivery",
    },
    trxId: String,

    status: {
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
