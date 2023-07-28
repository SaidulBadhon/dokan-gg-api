const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const viewerSchema = new Schema({
  viewer: { type: ObjectId, ref: "User", required: false },
  ip: { type: String, required: false },
  referer: { type: String, required: false },
});

const ViewSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["product", "store"],
      default: "product",
    },

    product: { type: ObjectId, ref: "Product", required: false },
    store: { type: ObjectId, ref: "Store", required: false },

    date: { type: Date, default: Date.now() },

    count: { type: Number, default: 0 },

    viewers: [viewerSchema],
  },
  { timestamps: true }
);

module.exports = model("View", ViewSchema);
