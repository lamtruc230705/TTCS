const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(100).required(),
  full_name: Joi.string().max(150).allow('', null),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).allow('', null),
  password: Joi.string().min(6).max(100).required(),
  role: Joi.string().valid('user', 'artist', 'admin').default('user'),
  status: Joi.string().valid('active', 'locked').default('active')
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(100),
  full_name: Joi.string().max(150).allow('', null),
  email: Joi.string().email(),
  phone: Joi.string().max(20).allow('', null),
  password: Joi.string().min(6).max(100).allow('', null),
  role: Joi.string().valid('user', 'artist', 'admin'),
  status: Joi.string().valid('active', 'locked')
}).min(1);

module.exports = { createUserSchema, updateUserSchema };
