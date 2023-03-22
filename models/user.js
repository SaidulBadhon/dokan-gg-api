const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    userName: { type: String, required: false },

    email: { type: String, required: true, unique: true },
    emailVerified: { type: Boolean, required: true, default: false },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["super", "admin", "seller", "buyer", "manager", "moderator"],
      default: "admin",
    },

    avatar: { type: String, required: false },

    isActive: { type: Boolean, default: true },
    acceptEUlA: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
