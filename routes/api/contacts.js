const express = require("express");
const CreateError = require("http-errors");
const ObjectId = require("mongoose").Types.ObjectId;

const { Contact, schemas } = require("../../models/contact");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await Contact.find();

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.contactId))
      throw new CreateError(400, "Not a valid ID");

    const result = await Contact.findById(req.params.contactId);

    if (!result) throw new CreateError(404, "Not found");

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = schemas.add.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const result = await Contact.create(req.body);

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.contactId))
      throw new CreateError(400, "Not a valid ID");

    const removedContact = await Contact.findByIdAndDelete(
      req.params.contactId
    );

    if (removedContact) {
      res.status(200).json({ message: "contact deleted" });
    } else {
      throw new CreateError(404, "Not found");
    }
  } catch (e) {
    next(e);
  }
});

router.put("/:contactId", async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.contactId))
      throw new CreateError(400, "Not a valid ID");

    const { error } = schemas.add.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const result = await Contact.findByIdAndUpdate(
      req.params.contactId,
      req.body,
      { new: true }
    );

    if (!result) throw new CreateError(404, "Not found");

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.patch("/:contactId/favorite", async (req, res, next) => {
  if (!ObjectId.isValid(req.params.contactId))
    throw new CreateError(400, "Not a valid ID");

  const { error } = schemas.updateFavorite.validate(req.body);

  if (error) throw new CreateError(400, error.message);

  const result = await Contact.findByIdAndUpdate(
    req.params.contactId,
    req.body,
    { new: true }
  );

  if (!result) throw new CreateError(404, "Not found");

  res.json(result);
});

module.exports = router;
