const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const TokenSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true },
    token: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model("Token", TokenSchema);
