const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    rate: { type: Number, required: true, min: 0, max: 5 },
    comment: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
