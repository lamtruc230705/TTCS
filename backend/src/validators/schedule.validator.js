const Joi = require("joi");

const createScheduleSchema = Joi.object({
  title: Joi.string().min(2).max(255).required(),
  description: Joi.string().allow("", null),
  location: Joi.string().allow("", null),
  start_time: Joi.date().required(),
  end_time: Joi.date().required(),
  status: Joi.string().valid("upcoming", "ongoing", "completed", "cancelled").optional(),
});

module.exports = {
  createScheduleSchema,
};