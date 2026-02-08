import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import AppError from './utils/appError.js';

import globalErrorHandler from './controllers/errorController.js';
import tourRourter from './routes/tourRoutes.js';
import userRourter from './routes/userRoutes.js';
import reviewRourter from './routes/reviewRoutes.js';
import helmet from 'helmet';
import cors from 'cors';

import hpp from 'hpp';
import sanitizationMiddleware from './utils/sanitize.js';

const app = express();

// 1) Global Middlewares

// Enable CORS for all origins
// In production, I should restrict this to my frontend's domain:
// app.use(cors({ origin: 'https://my-frontend-domain.com' }));
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set security HTTP headers
app.use(helmet());

const limiter = rateLimit({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); // Limit body size

// Data sanitization against XSS
app.use(sanitizationMiddleware);

// Prevent http parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'max_group_size',
      'difficulty',
      'rating',
      'ratings_quantity',
      'price',
    ],
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) Routes
app.use('/api/v1/tours', tourRourter);
app.use('/api/v1/users', userRourter);
app.use('/api/v1/reviews', reviewRourter);

app.all('*', (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
