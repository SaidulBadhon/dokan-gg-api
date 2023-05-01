const { Schema } = require("mongoose");
const { ObjectId } = Schema.Types;

// Define a schema for reviews
const reviewSchema = new Schema(
  {
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    createdBy: { type: ObjectId, ref: "User", required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Define a schema for ratings and reviews with total count field
const ratingSchema = new Schema({
  totalRating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
});

// module.exports = mongoose.model("Rating", ratingSchema);
module.exports = ratingSchema;
