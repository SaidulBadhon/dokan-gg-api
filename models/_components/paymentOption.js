const { Schema } = require("mongoose");

// Define a schema for ratings and reviews with total count field
const paymentOption = new Schema({
  bkash: String,
  rocket: String,
  nogod: String,
});

module.exports = paymentOption;
