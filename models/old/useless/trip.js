const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const memberSchema = new Schema({
  user: { type: ObjectId, ref: "User", required: true },
  accepted: { type: Boolean, required: false, default: false },
  status: {
    type: String,
    enum: ["planning", "going", "notGoing"],
    default: "planning",
  },
});
const placeSchema = new Schema({
  placeId: String,
  name: String,
  vicinity: String,
  photo: String,
  openNow: Boolean,
  icon: String,
  iconbackgroundColor: String,
  rating: Number,
  totalRating: Number,
  scope: String,
  businessStatus: String,
  location: {
    lat: Number,
    lng: Number,
  },
  geoLocation: { type: { type: String }, coordinates: [] },
  category: String,
});

// const locationSchema = new Schema({
//   lat: String,
//   lng: String,
// });

const TripSchema = new Schema(
  {
    createdBy: { type: ObjectId, ref: "User", required: true },
    members: [memberSchema],

    address: { type: String },
    location: {
      lat: Number,
      lng: Number,
    },
    geoLocation: { type: { type: String }, coordinates: [] },

    iconicPlaces: [placeSchema],
    restaurants: [placeSchema],
    hotels: [placeSchema],
    attractions: [placeSchema],
    museums: [placeSchema],

    message: { type: String, text: true },
    description: String,

    startDate: Date,
    endDate: Date,

    status: {
      type: String,
      enum: ["pending", "going", "visited", "canceled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", TripSchema);
