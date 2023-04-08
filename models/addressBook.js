const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const AddressBookSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
      required: false,
    },
    store: {
      type: ObjectId,
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

    createdBy: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = model("AddressBook", AddressBookSchema);
