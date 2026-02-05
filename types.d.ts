// types.d.ts
import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      name: string;
      email: string;
      role: string;
      password_changed_at: Date;
    }

    export interface Request {
      requestTime?: string;
      user?: User; // Add the user property
    }
  }
}
