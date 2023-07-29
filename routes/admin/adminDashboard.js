const express = require("express");
const route = express.Router();

const View = require("../../models/view");

route.post("/", async (req, res) => {
  try {
    const { startDate = "2023-07-01", endDate = "2023-07-31" } = req.body;

    const aggregatedViews = await View.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            type: "$type",
            refId: { $ifNull: ["$product", "$store"] },
          },
          totalViews: { $sum: "$count" },
          views: { $push: { _id: "$_id", view: "$count" } },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          totalViews: { $sum: "$totalViews" },
          data: {
            $push: {
              type: "$_id.type",
              refId: "$_id.refId",
              totalViews: "$totalViews",
              views: "$views",
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          allDates: { $push: "$_id" },
          data: {
            $push: { date: "$_id", totalViews: "$totalViews", data: "$data" },
          },
        },
      },
      {
        $unwind: {
          path: "$allDates",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$allDates",
          data: { $first: "$data" },
        },
      },
      {
        $group: {
          _id: null,
          allDates: { $push: "$_id" },
          data: {
            $push: {
              date: "$_id",
              totalViews: "$data.totalViews",
              data: "$data.data",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          datesWithData: {
            $map: {
              input: "$allDates",
              as: "date",
              in: {
                $let: {
                  vars: {
                    dataItem: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$data",
                            cond: { $eq: ["$$this.date", "$$date"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                  in: {
                    date: "$$date",
                    totalViews: { $ifNull: ["$$dataItem.totalViews", 0] },
                    products: {
                      $filter: {
                        input: { $ifNull: ["$$dataItem.data", []] },
                        as: "item",
                        cond: { $eq: ["$$item.type", "product"] },
                      },
                    },
                    stores: {
                      $filter: {
                        input: { $ifNull: ["$$dataItem.data", []] },
                        as: "item",
                        cond: { $eq: ["$$item.type", "store"] },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]);

    // Extract the final result from the aggregation output
    const finalResult = aggregatedViews[0]?.datesWithData || [];

    console.log(finalResult);

    return res.status(200).json(finalResult);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
});

module.exports = route;
