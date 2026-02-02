const sanitizeHtml = require('sanitize-html');

const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];
      if (typeof value === 'string') {
        // Using default options of sanitize-html
        obj[key] = sanitizeHtml(value);
      } else if (typeof value === 'object') {
        // Recursively sanitize nested objects and arrays
        sanitizeObject(value);
      }
    }
  }
};

const sanitizationMiddleware = (req, res, next) => {
  if (req.body) {
    sanitizeObject(req.body);
  }
  next();
};

module.exports = sanitizationMiddleware;
