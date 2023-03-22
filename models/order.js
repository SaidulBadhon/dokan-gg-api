const { Schema, model } = require("mongoose");
const { ObjectId } = Schema.Types;

const OrderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    state: String,

    invoiceNumber: { type: Sequelize.INTEGER, required: false },
    customerId: { type: Sequelize.INTEGER, required: true },
    total: { type: Sequelize.INTEGER, required: false },
    dueTotal: { type: Sequelize.INTEGER, required: false },
    coupon: { type: Sequelize.STRING, required: false },
    paymentMethod: { type: Sequelize.STRING, required: false },
    trxId: { type: Sequelize.STRING, required: false },
    status: { type: Sequelize.STRING, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
