const express = require("express");
const route = express.Router();

const Apply = require("../../models/apply");
const Job = require("../../models/job");
// const last7DaysNamesAndDates = require("../../utils/getDayAndTime");

route
  .get("/dashboard/jobStatistics/:days", async (req, res) => {
    const timeInDays = req.params.days || 7;

    console.log(" +========== > ", req.params.days);

    const today = new Date();

    const last7Days = [...Array(parseInt(timeInDays))].map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      return date;
    });

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const last7DaysNamesAndDates = last7Days.map((day) => {
      const dayName = daysOfWeek[day.getDay()];
      const dayDate = day.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
      return `${dayName} ${dayDate.replace(/,/g, "")}`;
    });

    // Task 1:
    const jobs = await Job.find({
      user: req.user._id,
      // $gte: new Date("2022-11-30T01:05:25.877+00:00"),
    });
    let allJobViews = [];
    jobs?.map((job) => {
      job?.view?.map((v) => {
        allJobViews.push(new Date(v));
      });
    });
    let jobView = allJobViews.reduce((a, c) => {
      let d = c.toDateString();
      a[d] = a[d] ? a[d] + 1 : 1;
      return a;
    }, {});

    // Task 2:
    const applies = await Apply.find({
      company: jobs[0]?.company,
      createdAt: {
        $gte: new Date(new Date().getTime() - timeInDays * 24 * 60 * 60 * 1000),
        $lt: new Date(new Date().getTime()),
      },
    });
    let allApplyCount = [];
    applies?.map((aply) => {
      allApplyCount.push(new Date(aply?.createdAt));
    });
    let jobApplied = allApplyCount.reduce((a, c) => {
      let d = c.toDateString();
      a[d] = a[d] ? a[d] + 1 : 1;
      return a;
    }, {});

    let sudoJobViewApplied = [];

    last7DaysNamesAndDates?.map((dateFromVar) => {
      // let dataToSave = [];

      let i = Object.keys(jobView).findIndex((e) => e === dateFromVar);

      if (i > -1) {
        sudoJobViewApplied.push({
          date: dateFromVar,
          count: Object.values(jobView)[i],
        });
      } else {
        sudoJobViewApplied.push({ date: dateFromVar, count: 0 });
      }

      // if (Object.keys(jobView).includes(dateFromVar)) {
      //   sudoJobViewApplied.push({ date: dateFromVar, count: jobView[item] });
      // } else {
      //   sudoJobViewApplied.push({ date: dateFromVar, count: 0 });
      // }

      // Object.keys(jobView).map((item, index) => {
      //   if (item === dateFromVar) {
      //     console.log(
      //       " DATAAAAAAAAAAAAAAAAAAAAAAAAAA : ",
      //       dateFromVar,
      //       " _--------- count: ---- ",
      //       jobView[item]
      //     );
      //     dateFromVar = { date: dateFromVar, count: jobView[item] };
      //   } else {
      //     dateFromVar = { date: dateFromVar, count: 0 };
      //   }

      //   // console.log("Eeeeeeeee : ", item, " - ", index);
      //   // sudoJobViewApplied?.push({ date: item, count: jobView[item] });
      // });

      // sudoJobViewApplied.push(dataToSave);
    });

    let sudoJobApplied = [];

    last7DaysNamesAndDates?.map((dateFromVar) => {
      let i = Object.keys(jobApplied).findIndex((e) => e === dateFromVar);

      if (i > -1) {
        sudoJobApplied.push({
          date: dateFromVar,
          count: Object.values(jobApplied)[i],
        });
      } else {
        sudoJobApplied.push({ date: dateFromVar, count: 0 });
      }
    });

    // Object.keys(jobApplied).map((item, index) => {
    //   // console.log("Eeeeeeeee : ", item, " - ", index);
    //   sudoJobApplied?.push({ date: item, count: jobApplied[item] });
    // });

    // let sortedJobViewApplied = sudoJobViewApplied?.sort(
    //   (a, b) => new Date(a.date) - new Date(b.date)
    // );
    // let sortedJobApplied = sudoJobApplied?.sort(
    //   (a, b) => new Date(a.date) - new Date(b.date)
    // );

    let sortedJobViewApplied = sudoJobViewApplied?.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    let sortedJobApplied = sudoJobApplied?.sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    // console.log(
    //   "applies =============> ",
    //   applies,
    //   " --- jobs ========= > ",
    //   jobs,
    //   new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    //   new Date()
    // );
    // console.log(
    //   "sortedJobViewApplied =============> ",
    //   sortedJobViewApplied.length,
    //   " --- sortedJobApplied +========= > ",
    //   sortedJobApplied.length
    // );

    return res
      .status(200)
      .json({ jobView: sortedJobViewApplied, jobApplied: sortedJobApplied });
  })
  .get("/:companyId/recent", async (req, res) => {
    try {
      const jobs = await Job.find({ company: req.params?.companyId })
        .populate("company")
        .limit(3)
        .sort({ createdAt: -1 });

      console.log(jobs);

      return res.status(200).json(jobs);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  });

module.exports = route;
