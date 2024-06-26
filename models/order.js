const { Schema, model } = require("mongoose");
const AddressBookSchema = require("./_components/addressBook");
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
  colorIndex: String,
  // variant: { type: String, default: "default" },

  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: { type: ObjectId, ref: "User", required: false },
    deliveryAddress: AddressBookSchema,
    deliveryDate: Date,
    billingAddress: AddressBookSchema,

    products: [productWithPriceSchema],
    store: { type: ObjectId, ref: "Store", required: true },

    subTotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 75 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true },

    paidAmount: { type: Number, required: true, default: 0 },

    coupon: { type: ObjectId, ref: "Coupon", required: false },

    payment: {
      paymentMethod: {
        type: String,
        enum: ["bank", "bkash", "rocket", "nogod", "cashOnDelivery", "other"],
        default: "cashOnDelivery",
      },
      txnId: String,

      hasPaid: Boolean,
    },

    status: {
      type: String,
      enum: [
        "pendingPayment",
        "onHold",
        "failed",

        "pending",
        "processing",
        "shipped",
        "localFacility",
        "outForDelivery",
        "delivered",
        "completed",

        "canceled",

        "refunded",
      ],
      default: "pendingPayment",
    },
  },
  { timestamps: true }
);

module.exports = model("Order", OrderSchema);
