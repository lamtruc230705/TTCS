const Joi = require('joi');

const addCartSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1)
});

const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required()
});

const selectCartSchema = Joi.object({
  is_selected: Joi.boolean().required()
});

const selectAllCartSchema = Joi.object({
  is_selected: Joi.boolean().required()
});

module.exports = {
  addCartSchema,
  updateCartSchema,
  selectCartSchema,
  selectAllCartSchema
};
