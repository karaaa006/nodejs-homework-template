const express = require("express");
const CreateError = require("http-errors");
const Joi = require("joi");

const contacts = require("../../models/contacts");

const contactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
});

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await contacts.listContacts();

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get("/:contactId", async (req, res, next) => {
  try {
    const result = await contacts.getContactById(req.params.contactId);

    if (!result) throw new CreateError(404, "Not found");

    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = contactSchema.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const result = await contacts.addContact(req.body);

    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.delete("/:contactId", async (req, res, next) => {
  try {
    const removedContact = await contacts.removeContact(req.params.contactId);

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
    const { error } = contactSchema.validate(req.body);

    if (error) throw new CreateError(400, error.message);

    const result = await contacts.updateContact(req.params.contactId, req.body);

    if (!result) throw new CreateError(404, "Not found");

    res.json(result);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
