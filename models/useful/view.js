const { Schema } = require("mongoose");
const { ObjectId } = Schema.Types;

const viewCountSchema = new Schema(
  {
    user: { type: ObjectId, ref: "Category" },
    ip: String,
    referer: String,
  },
  { timestamps: true }
);

const viewSchema = new Schema({
  count: { type: Number, default: 0 },
  viewers: [viewCountSchema],
});

module.exports = viewSchema;
