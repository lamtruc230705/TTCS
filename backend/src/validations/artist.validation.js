const Joi = require('joi');

const artistSchema = Joi.object({
  user_id: Joi.number().integer().positive().required().messages({
    'any.required': 'Vui lòng chọn Gmail tài khoản artist',
    'number.base': 'Gmail tài khoản artist không hợp lệ',
    'number.integer': 'Gmail tài khoản artist không hợp lệ',
    'number.positive': 'Gmail tài khoản artist không hợp lệ'
  }),
  stage_name: Joi.string().max(150).required(),
  full_name: Joi.string().max(150).allow('', null),
  first_name: Joi.string().max(100).allow('', null),
  last_name: Joi.string().max(100).allow('', null),
  image: Joi.string().allow('', null),
  birth_date: Joi.date().allow(null),
  height: Joi.string().max(50).allow('', null),
  weight: Joi.string().max(50).allow('', null),
  partner_name: Joi.string().max(150).allow('', null),
  partner_artist_id: Joi.number().integer().positive().allow(null),
  mascot: Joi.string().max(150).allow('', null),
  artist_role: Joi.string().max(100).allow('', null),
  description: Joi.string().allow('', null),
  is_featured: Joi.boolean().default(false),
  status: Joi.string().valid('active', 'hidden').default('active'),
  works: Joi.array().items(Joi.object({
    title: Joi.string().required(),
    release_year: Joi.number().integer().min(1900).max(2155).allow(null)
  })).default([])
});

const artistUpdateSchema = artistSchema.fork(['stage_name'], (schema) => schema.optional()).min(1);

const scheduleSchema = Joi.object({
  title: Joi.string().max(255).required(),
  event_date: Joi.date().required(),
  start_time: Joi.string().allow('', null),
  end_time: Joi.string().allow('', null),
  status: Joi.string().valid('upcoming', 'completed', 'cancelled').default('upcoming'),
  note: Joi.string().allow('', null)
});

module.exports = {
  artistSchema,
  artistUpdateSchema,
  scheduleSchema
};
