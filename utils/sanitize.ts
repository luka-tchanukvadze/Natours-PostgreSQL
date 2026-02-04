import { Request, Response, NextFunction } from 'express';
import * as sanitizeHtml from 'sanitize-html';

const sanitizeObject = (obj: any): any => {
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

  return obj;
};

const sanitizationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (req.body) {
    sanitizeObject(req.body);
  }
  next();
};

module.exports = sanitizationMiddleware;
