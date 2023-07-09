const { Schema } = require("mongoose");

const AddressBookSchema = new Schema(
  {
    type: { type: String, default: "Home" },

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

module.exports = model("AddressBook", AddressBookSchema);
