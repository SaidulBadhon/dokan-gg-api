const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const PartnerSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    photo: { type: String, required: true },
    company: { type: ObjectId, ref: "Company", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Partner", PartnerSchema);
