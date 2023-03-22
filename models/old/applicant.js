const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const EducationSchema = new Schema({
  instituteName: { type: String, required: true },
  major: { type: String, required: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: false },

  additionalInformation: { type: String, required: false },
});
const ExperienceSchema = new Schema({
  companyName: { type: String, required: true },
  position: { type: String, required: true },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: false },

  additionalInformation: { type: String, required: false },
});
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  // image: { type: ObjectId, ref: "File", required: false },
  image: { type: String, required: false },

  startDate: { type: Date, required: true },
  endDate: { type: Date, required: false },

  additionalInformation: { type: String, required: false },
});
const SocialLinkSchema = new Schema({
  github: { type: String, required: false },
  sourceForge: { type: String, required: false },
});

const ApplicantSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: false },

    address: { type: String, required: false },
    location: { type: { type: String }, coordinates: [] },

    bio: { type: String, required: false },
    aboutMe: { type: String, required: false },

    // workingAt: { type: String, required: false },
    // position: { type: String, required: false },
    introVideo: { type: String, required: false },

    educations: [EducationSchema],
    experiences: [ExperienceSchema],
    skills: [{ type: String, required: false }],
    projects: [ProjectSchema],

    dateOfBirth: { type: Date, required: false },
    publicEmail: { type: String, required: false },
    phoneNumber: { type: String, required: false },
    languages: { type: String, required: false },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    socialLinks: SocialLinkSchema,
    jobStatus: {
      type: String,
      enum: ["Working", "Seeking", "Disinterested"],
      default: "Seeking",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Applicant", ApplicantSchema);
