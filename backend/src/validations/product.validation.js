const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  price: Joi.number().min(0).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().allow('', null),
  status: Joi.string().valid('active', 'hidden', 'out_of_stock').default('active'),
  is_featured: Joi.boolean().default(false),
  artist_ids: Joi.array().items(Joi.number().integer().positive()).default([])
});

const productUpdateSchema = productSchema.fork(['name', 'price', 'stock'], (schema) => schema.optional()).min(1);

module.exports = {
  productSchema,
  productUpdateSchema
};
