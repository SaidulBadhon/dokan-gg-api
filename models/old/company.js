const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const socialLinkSchema = new Schema({
  facebook: { type: String, required: false },
  twitter: { type: String, required: false },
  linkedin: { type: String, required: false },
  drooble: { type: String, required: false },
  instagram: { type: String, required: false },
});

// const techStackSchema = new Schema({
//   label: { type: String, required: false },
//   avatar: { type: ObjectId, ref: "File", required: false },
// });

// const officeLocationSchema = new Schema({
//   address: { type: String, required: false },
//   location: { type: { type: String }, coordinates: [] },
// });

// const gallerySchema = new Schema({
//   photo1: { type: String, required: false },
//   photo2: { type: String, required: false },
//   photo3: { type: String, required: false },
//   photo4: { type: String, required: false },
// });

const officeLocationSchema = new Schema({
  address: { type: String, required: false },
  location: { type: { type: String }, coordinates: [] },
});

const CompanySchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: false },

    name: { type: String, required: false },
    // logo: { type: ObjectId, ref: "File", required: false },
    logo: { type: String, required: false },
    website: { type: String, required: false },

    foundedAt: { type: Date, required: false },

    employees: [{ type: ObjectId, ref: "User", required: false }],
    type: {
      type: String,
      enum: ["Startups", "Medium Enterprise", "Large Enterprise"],
      required: false,
    },

    industry: [
      {
        type: String,
        enum: [
          "Advertising",
          "Business Service",
          "Cloud",
          "Consumer Tech",
          "Education",
          "Fintech",
          "Gaming",
          "Food & Beverage",
          "Healthcare",
          "Hostinng",
          "Media",
        ],
        required: false,
      },
    ],

    description: { type: String, required: false },
    socialLinks: socialLinkSchema,

    // gallery: gallerySchema,
    photo1: { type: String, required: false },
    photo2: { type: String, required: false },
    photo3: { type: String, required: false },
    photo4: { type: String, required: false },

    perksAndBenefits: [
      { type: ObjectId, ref: "PerksAndBenefits", required: false },
    ],

    // techStack: [techStackSchema],
    techStack: [{ type: String, required: false }],

    // officeLocations: [officeLocationSchema],
    officeLocations: [officeLocationSchema],
    headquarter: officeLocationSchema,

    view: [{ type: Date, required: false }],
    featured: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Company", CompanySchema);
