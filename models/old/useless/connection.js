const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema.Types;

const participant = new Schema({
  user: { type: ObjectId, ref: "User", required: true },
  accepted: { type: Boolean, required: false, default: false },
});

const ConnectionSchema = new mongoose.Schema(
  {
    participants: [participant],
    matchedBy: { type: ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Connection", ConnectionSchema);
