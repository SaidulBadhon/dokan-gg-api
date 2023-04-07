const mongoose = require("mongoose");

const AddressBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: false,
    },

    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AddressBook", AddressBookSchema);
