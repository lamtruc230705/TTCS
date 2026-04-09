const Joi = require("joi");

const createProductSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow("", null),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().allow("", null),
  category_id: Joi.number().integer().optional(),
});

module.exports = {
  createProductSchema,
};