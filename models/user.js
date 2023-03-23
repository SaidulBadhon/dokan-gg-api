const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    avatar: String,

    firstName: String,
    lastName: String,
    userName: String,

    number: String,
    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true, default: false },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["super", "admin", "seller", "buyer", "manager", "moderator"],
      default: "admin",
    },

    isActive: { type: Boolean, default: true },
    acceptEUlA: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
