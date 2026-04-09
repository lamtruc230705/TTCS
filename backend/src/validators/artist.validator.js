const Joi = require("joi");

const updateArtistProfileSchema = Joi.object({
  stage_name: Joi.string().allow("", null),
  full_name: Joi.string().allow("", null),
  biography: Joi.string().allow("", null),
  partner: Joi.string().allow("", null),
  mascot: Joi.string().allow("", null),
  works: Joi.string().allow("", null),
  image: Joi.string().allow("", null),
});

module.exports = {
  updateArtistProfileSchema,
};