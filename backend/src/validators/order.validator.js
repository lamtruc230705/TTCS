const Joi = require("joi");

const checkoutSchema = Joi.object({
  shipping_address: Joi.string().required(),
  payment_method: Joi.string().valid("cod", "banking", "card").required(),
  note: Joi.string().allow("", null),
});

module.exports = {
  checkoutSchema,
};