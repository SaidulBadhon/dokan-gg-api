const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const TokenSchema = new Schema(
  {
    title: { type: String, required: true },
    details: { type: String, required: true },
    products: [{ type: ObjectId, ref: "Product", required: false }],
  },
  { timestamps: true }
);

module.exports = model("Token", TokenSchema);
