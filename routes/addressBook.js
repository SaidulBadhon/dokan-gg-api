const express = require("express");
const route = express.Router();

const AddressBook = require("../models/addressBook");

route
  .get("/", async (req, res) => {
    const { sort = "", range = "", filter = "{}", companyId } = req.query;
    const rangeExp = range && JSON.parse(range);

    try {
      const addressBooks = await AddressBook.find({ company: companyId })
        .populate("company")
        .limit(rangeExp.length && rangeExp[1] - rangeExp[0] + 1)
        .skip(rangeExp.length && rangeExp[0])
        .sort(sort);

      return res.status(200).json(addressBooks);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/count", async (req, res) => {
    try {
      // const count = await AddressBook.estimatedDocumentCount({ user: req.user._id });
      const count = await AddressBook.countDocuments({ user: req.user._id });

      return res.status(200).json(count);
    } catch (err) {
      console.log(err);
      return res.status(500).send(err);
    }
  })
  .get("/:id", async (req, res) => {
    try {
      const addressBook = await AddressBook.findByIdAndUpdate(req.params.id, {
        $inc: { view: 1 },
      }).populate("company");

      return res.status(200).json(addressBook);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "AddressBook profile does not exist." });
    }
  })
  .post("/", async (req, res) => {
    try {
      console.log("==================> ", req.body);
      const addressBook = await AddressBook.create({
        ...req.body,
        createdBy: req?.user?._id,
      });

      console.log(addressBook);

      return res.status(200).json(addressBook);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Fail to create a addressBook" });
    }
  })
  .put("/", async (req, res) => {
    const addressBook = await AddressBook.findByIdAndUpdate(
      { _id: req.addressBook._id },
      { $set: req.body },
      { $upsert: true, new: true }
    ).select();
    res.status(200).json(addressBook);
  })
  .put("/:id", async (req, res) => {
    console.log("+================== > ", req.params.id, " - ", req.body);
    const addressBook = await AddressBook.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        $upsert: true,
      }
    );

    res.status(200).json(addressBook);
  })
  .delete("/:id", async (req, res) => {
    await AddressBook.deleteOne({ _id: req.params.id });
    res.status(200).json({ id: req.params.id });
  });

module.exports = route;
