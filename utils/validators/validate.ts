import { ZodSchema, ZodError } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
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
