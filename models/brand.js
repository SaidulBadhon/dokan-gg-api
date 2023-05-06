const { model, Schema } = require("mongoose");
const { ObjectId } = Schema.Types;

const BrandSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: false },

    icon: { type: String, required: false },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      default: "pending",
    },
    createdBy: { type: ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = model("Brand", BrandSchema);
