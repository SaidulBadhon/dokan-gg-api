const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const FileSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      default: "image",
    },
    name: { type: String, required: false },
    key: { type: String, required: true },
    size: { type: Number, required: false },
    // location: { type: String, required: false },

    thumbnail: { type: String, default: "" },

    width: { type: Number, required: false },
    height: { type: Number, required: false },

    createdBy: { type: ObjectId, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", FileSchema);
