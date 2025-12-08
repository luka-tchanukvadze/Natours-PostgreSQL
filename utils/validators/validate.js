exports.validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body); // validated
    next();
  } catch (error) {
    return res.status(400).json({
      staus: 'fail',
      error: error.message,
    });
  }
};
