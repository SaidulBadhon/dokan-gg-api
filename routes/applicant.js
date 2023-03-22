const express = require("express");
const route = express.Router();

const Applicant = require("../models/applicant");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "" } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const applicants = await Applicant.find()
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(applicants);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const applicant = await Applicant.findOne({ user: req.params.id });

      return res.status(200).json(applicant);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Applicant profile does not exist." });
    }
  })
  .post("/create", async (req, res) => {
    try {
      const applicant = new Applicant({ user: req?.user?._id });
      return res.status(200).json(applicant);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a applicant profile" });
    }
  })
  .put("/", async (req, res) => {
    const applicant = await Applicant.findByIdAndUpdate(
      { _id: req.applicant._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(applicant);
  })
  .put("/:id", async (req, res) => {
    console.log("+================== > ", req.body);
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { $upsert: true }
    );

    res.status(200).json(applicant);
  })
  .put("/:applicantId/educations/add", async (req, res) => {
    try {
      const applicant = await Applicant.findById(req.params.applicantId);

      let curArray = applicant.educations || [];
      console.log(req.body);
      curArray.push(req.body);

      applicant["educations"] = curArray;

      const updated = await Applicant.findByIdAndUpdate(
        req.params.applicantId,
        applicant
      );

      res.status(200).json(updated);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  })
  .put("/:applicantId/educations/:educationId/update", async (req, res) => {
    try {
      console.log(req.body);
      const applicant = await Applicant.findOneAndUpdate(
        {
          _id: req.params.applicantId,
          "educations._id": req.params.educationId,
        },
        {
          $set: {
            "educations.$.instituteName": req.body.instituteName,
            "educations.$.major": req.body.major,
            "educations.$.startDate": req.body.startDate,
            "educations.$.endDate": req.body.endDate,
            "educations.$.additionalInformation":
              req.body.additionalInformation,
          },
        },
        false
      );

      res.status(200).json(applicant);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.message });
    }
  })
  .delete("/:applicantId/educations/:educationId/remove", async (req, res) => {
    try {
      const applicant = await Applicant.findByIdAndUpdate(
        req.params.applicantId,
        {
          $pull: {
            educations: { _id: req.params.educationId },
          },
        }
      );

      res.status(200).json(applicant);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  })
  .put("/:applicantId/experiences/add", async (req, res) => {
    try {
      const applicant = await Applicant.findById(req.params.applicantId);

      let curArray = applicant.experiences || [];
      console.log(req.body);
      curArray.push(req.body);

      applicant["experiences"] = curArray;

      const updated = await Applicant.findByIdAndUpdate(
        req.params.applicantId,
        applicant
      );

      res.status(200).json(updated);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  })
  .put("/:applicantId/experiences/:experienceId/update", async (req, res) => {
    try {
      console.log(req.body);
      const applicant = await Applicant.findOneAndUpdate(
        {
          _id: req.params.applicantId,
          "experiences._id": req.params.experienceId,
        },
        {
          $set: {
            "experiences.$.companyName": req.body.companyName,
            "experiences.$.position": req.body.position,
            "experiences.$.startDate": req.body.startDate,
            "experiences.$.endDate": req.body.endDate,
            "experiences.$.additionalInformation":
              req.body.additionalInformation,
          },
        },
        false
      );

      res.status(200).json(applicant);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.message });
    }
  })
  .delete(
    "/:applicantId/experiences/:experienceId/remove",
    async (req, res) => {
      try {
        const applicant = await Applicant.findByIdAndUpdate(
          req.params.applicantId,
          {
            $pull: {
              experiences: { _id: req.params.experienceId },
            },
          }
        );

        res.status(200).json(applicant);
      } catch (err) {
        res.status(400).send({ error: err.message });
      }
    }
  )
  .put("/:applicantId/projects/add", async (req, res) => {
    try {
      const applicant = await Applicant.findById(req.params.applicantId);

      let curArray = applicant.projects || [];
      console.log(req.body);
      curArray.push(req.body);

      applicant["projects"] = curArray;

      const updated = await Applicant.findByIdAndUpdate(
        req.params.applicantId,
        applicant
      );

      res.status(200).json(updated);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  })
  .put("/:applicantId/projects/:projectId/update", async (req, res) => {
    try {
      const applicant = await Applicant.findOneAndUpdate(
        {
          _id: req.params.applicantId,
          "projects._id": req.params.projectId,
        },
        {
          $set: {
            "projects.$.name": req.body.name,
            "projects.$.image": req.body.image,
            "projects.$.startDate": req.body.startDate,
            "projects.$.endDate": req.body.endDate,
            "projects.$.additionalInformation": req.body.additionalInformation,
          },
        },
        false
      );

      res.status(200).json(applicant);
    } catch (err) {
      console.log(err);
      res.status(400).send({ error: err.message });
    }
  })
  .delete("/:applicantId/projects/:projectId/remove", async (req, res) => {
    try {
      const applicant = await Applicant.findByIdAndUpdate(
        req.params.applicantId,
        {
          $pull: {
            projects: { _id: req.params.projectId },
          },
        }
      );

      res.status(200).json(applicant);
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  })
  .delete("/:id", async (req, res) => {
    await Applicant.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;

// .put("/:id/educations/add", async (req, res) => {})
// .put("/:id/educations/remove", async (req, res) => {})
