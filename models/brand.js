const { model, Schema } = require("mongoose");

const BrandSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: false },

    icon: { type: String, required: false },
  },
  { timestamps: true }
);

module.exports = model("Brand", BrandSchema);
