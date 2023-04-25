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
    password: { type: String, required: false },

    role: {
      type: String,
      enum: ["super", "admin", "seller", "manager", "employee", "buyer"],
      default: "admin",
    },

    facebookId: { type: String, required: false, unique: true },
    googleId: { type: String, required: false, unique: true },

    provider: {
      type: String,
      enum: ["facebook", "google", "email", "number"],
      default: "email",
    },

    isActive: { type: Boolean, default: true },
    acceptEUlA: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
