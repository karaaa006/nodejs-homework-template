const express = require("express");
const CreateError = require("http-errors");
const ObjectId = require("mongoose").Types.ObjectId;
const { authenticate } = require("../../middlewares");

const { Contact, schemas } = require("../../models/contact");

const router = express.Router();

router.get("/", authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, ...filter } = req.query;
    if (isNaN(page) || isNaN(limit))
      throw new CreateError(400, "Page and limit must be a number");

    const skip = (page - 1) * limit;

    const result = await Contact.find(
      { owner: req.user.id, ...filter },
      "-createdAt -updatedAt",
      { skip, limit }
    ).populate("owner", "email");

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/:contactId", authenticate, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.contactId))
      throw new CreateError(400, "Not a valid ID");

    const result = await Contact.findById(req.params.contactId);

    if (!result) throw new CreateError(404, "Not found");

    if (String(result.owner) !== req.user.id)
      throw new CreateError(401, "Not authorized");

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  try {
    const { error } = schemas.add.validate(req.body);

    if (error) throw new CreateError(400, error.message);
    const data = { ...req.body, owner: req.user._id };

    const result = await Contact.create(data);

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.delete("/:contactId", authenticate, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.contactId))
      throw new CreateError(400, "Not a valid ID");

    const result = await Contact.findById(req.params.contactId);

    if (String(result.owner) !== req.user.id)
      throw new CreateError(401, "Not authorized");

    const removedContact = await Contact.findByIdAndDelete(
      req.params.contactId,
      { owner: req.user.id }
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

router.put("/:contactId", authenticate, async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.contactId))
      throw new CreateError(400, "Not a valid ID");

    const { error } = schemas.add.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const findedContact = await Contact.findById(req.params.contactId);

    if (String(findedContact.owner) !== req.user.id)
      throw new CreateError(401, "Not authorized");

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

router.patch("/:contactId/favorite", authenticate, async (req, res, next) => {
  if (!ObjectId.isValid(req.params.contactId))
    throw new CreateError(400, "Not a valid ID");

  const { error } = schemas.updateFavorite.validate(req.body);

  if (error) throw new CreateError(400, error.message);

  const findedContact = await Contact.findById(req.params.contactId);

  if (String(findedContact.owner) !== req.user.id)
    throw new CreateError(401, "Not authorized");

  const result = await Contact.findByIdAndUpdate(
    req.params.contactId,
    req.body,
    { new: true }
  );

  if (!result) throw new CreateError(404, "Not found");

  res.json(result);
});

module.exports = router;
