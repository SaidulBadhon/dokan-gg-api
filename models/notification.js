const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const NotificationSchema = new Schema(
  {
    sender: { type: ObjectId, ref: "User", required: false },
    receiver: { type: ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["System", "Order", "JobStatus"],
      default: "System",
    },
    content: { type: Object, required: false },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Notification", NotificationSchema);
