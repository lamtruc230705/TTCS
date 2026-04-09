// validate dữ liệu đầu vào bằng Joi

const { errorResponse } = require("../utils/response");

module.exports = (schema, target = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[target], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return errorResponse(
        res,
        "Dữ liệu không hợp lệ",
        422,
        error.details.map((item) => item.message)
      );
    }

    req[target] = value;
    next();
  };
};