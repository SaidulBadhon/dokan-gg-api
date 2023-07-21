const { model, Schema } = require("mongoose");

const CompresImageSchema = new Schema(
  {
    key: { type: String, required: true },
    location: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = model("CompresImage", CompresImageSchema);
