import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  <T>(schema: ZodSchema<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as T;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formatted = error.flatten();
        return res.status(400).json({
          status: 'fail',
          errors: formatted.fieldErrors || formatted.formErrors,
        });
      }

      return res.status(400).json({
        status: 'fail',
        errors: [String(error)],
      });
    }
  };
