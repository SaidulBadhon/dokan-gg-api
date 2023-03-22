const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

// const keyValuePairSchema = new Schema({
//   label: { type: String, required: true },
//   state: { type: Boolean, required: true },
// });

const salarySchema = new Schema({
  min: { type: Number, required: true },
  max: { type: Number, required: true },
  currency: { type: String, required: true },
});

const perksAndBenefitsSchema = new Schema({
  icon: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const JobSchema = new mongoose.Schema(
  {
    user: { type: ObjectId, ref: "User", required: false },
    company: { type: ObjectId, ref: "Company", required: false },

    title: { type: String, required: false },
    description: { type: String, required: false },
    // responsibilities: [keyValuePairSchema],
    responsibilities: { type: String, required: true },
    // whoYouAre: [keyValuePairSchema],
    whoYouAre: { type: String, required: true },
    // niceToHaves: [keyValuePairSchema],
    niceToHaves: { type: String, required: true },

    // perksAndBenefits: [{ type: ObjectId, ref: "PerksAndBenefits", required: false }],
    perksAndBenefits: [perksAndBenefitsSchema],

    dueDate: { type: Date, required: true },

    type: {
      type: String,
      enum: ["Full-Time", "Internship", "Project"],
      default: "Full-Time",
    },

    salary: salarySchema,
    requireJapaneseLanguage: { type: Boolean, required: false },
    sponsorVISA: { type: Boolean, required: false },

    categories: [
      {
        type: String,
        enum: ["Technology", "Design", "Business", "Sales"],
        required: false,
      },
    ],
    skills: [{ type: String, required: false }],

    status: {
      type: String,
      enum: ["Live", "Closed", "Pending"],
      default: "Pending",
    },

    createdBy: { type: ObjectId, ref: "User", required: false },

    // applicants: [{ type: ObjectId, ref: "Applicant", required: false }],
    applications: [{ type: ObjectId, ref: "Apply", required: false }],
    needs: { type: Number, required: false, default: 10 },
    accepted: [{ type: ObjectId, ref: "Applicant", required: false }],

    view: [{ type: Date, required: false }],
    featured: { type: Boolean, required: false, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
