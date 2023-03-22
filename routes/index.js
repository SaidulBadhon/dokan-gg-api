const express = require("express");
const router = express.Router();
const allowIfLogin = require("../middlewares/allowIfLogin");

const auth = require("./auth");
const user = require("./user");
const applicant = require("./applicant");
const company = require("./company");
const job = require("./job");
const apply = require("./apply");
const notification = require("./notification");

const adminController = require("./controller/adminController");
const applicantController = require("./controller/applicantController");
const companyController = require("./controller/companyController");

const publicJob = require("./public/publicJob");
const publicCompany = require("./public/publicCompany");
const publicHome = require("./public/publicHome");

router.use("/auth", auth);
router.use("/users", allowIfLogin, user);
router.use("/applicant", allowIfLogin, applicant);
router.use("/companies", allowIfLogin, company);
router.use("/jobs", allowIfLogin, job);
router.use("/apply", allowIfLogin, apply);
router.use("/notification", allowIfLogin, notification);

router.use("/controller/admin", allowIfLogin, adminController);
router.use("/controller/applicant", allowIfLogin, applicantController);
router.use("/controller/company", allowIfLogin, companyController);

router.use("/public/jobs", publicJob);
router.use("/public/companies", publicCompany);

router.use("/public/home", publicHome);

module.exports = router;
