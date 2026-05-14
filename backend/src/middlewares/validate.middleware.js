function validate(schema) {
  return function validateMiddleware(req, res, next) {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      return res.status(422).json({
        success: false,
        message: 'Du lieu khong hop le.',
        details: error.details.map((item) => item.message)
      });
    }

    req.body = value;
    next();
  };
}

module.exports = validate;
