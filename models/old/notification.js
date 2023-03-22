const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: false },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["System", "Appy", "JobStatus"],
      default: "System",
    },
    content: { type: Object, required: false },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
