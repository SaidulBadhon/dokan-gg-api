const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const ApplySchema = new mongoose.Schema(
  {
    applicantUser: { type: ObjectId, ref: "User", required: true },
    applicantProfile: { type: ObjectId, ref: "Applicant", required: true },

    company: { type: ObjectId, ref: "Company", required: true },
    job: { type: ObjectId, ref: "Job", required: true },

    linkedInURL: { type: String, required: false },
    additionalInformation: { type: String, required: false },
    resumeURL: { type: String, required: false },

    stage: {
      type: String,
      enum: [
        "In-Review",
        // "Shortlisted",
        "Interviewing",
        "Offered",
        "Hired",
        "Declined",
      ],
      default: "In-Review",
    },
    interviewStatus: {
      type: String,
      enum: ["Pending", "Schedule", "Progress", "Finish", "Cancel"],
      default: "Pending",
    },

    archived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Apply", ApplySchema);
