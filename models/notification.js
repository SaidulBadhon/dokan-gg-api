const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const NotificationSchema = new Schema(
  {
    sender: { type: ObjectId, ref: "User", required: false },
    receiver: { type: ObjectId, ref: "User", required: false },
    receiverRole: { type: String, enum: ["super", "admin", "seller", "user"] },

    type: {
      type: String,
      enum: ["system", "order", "product", "store", "user"],
      default: "system",
    },
    content: { type: Object, required: false },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("Notification", NotificationSchema);
