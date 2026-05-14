const Joi = require('joi');

const checkoutSchema = Joi.object({
  cart_item_ids: Joi.array().items(Joi.number().integer().positive()).default([]),
  shipping_fee: Joi.number().min(0).default(25000),
  note: Joi.string().allow('', null)
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipping', 'delivered', 'cancelled').required()
});

module.exports = {
  checkoutSchema,
  updateOrderStatusSchema
};
