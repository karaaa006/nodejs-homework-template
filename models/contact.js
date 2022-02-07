const { Schema, model } = require("mongoose");
const Joi = require("joi");

const joiContactSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
  favorite: Joi.boolean().default(false),
});

const joiUpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

const contactSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for contact"],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { versionKey: false, timestamps: true }
);

const Contact = model("contact", contactSchema);

module.exports = {
  Contact,
  schemas: {
    add: joiContactSchema,
    updateFavorite: joiUpdateFavoriteSchema,
  },
};
