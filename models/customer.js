const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const CustomerSchema = new Schema(
  {
    user: { type: ObjectId, ref: "User", required: true },
    avatar: { type: String, required: true },
    slug: { type: String, required: true },
    label: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("Customer", CustomerSchema);
