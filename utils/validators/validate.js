export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body); // Validated
    next();
  } catch (error) {
    // Flattened Zod errors for simpler output
    const formatted = error.flatten
      ? error.flatten()
      : { formErrors: [error.message] };

    return res.status(400).json({
      status: 'fail',
      errors: formatted.fieldErrors || formatted.formErrors,
    });
  }
};
