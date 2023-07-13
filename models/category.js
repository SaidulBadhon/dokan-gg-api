const { model, Schema } = require("mongoose");
const { ObjectId } = Schema.Types;

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: false },

    parent: { type: ObjectId, ref: "Category", required: false },
    icon: { type: String, required: false },

    createdBy: { type: ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = model("Category", CategorySchema);
