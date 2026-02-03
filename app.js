const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRourter = require('./routes/tourRoutes');
const userRourter = require('./routes/userRoutes');
const reviewRourter = require('./routes/reviewRoutes');
const helmet = require('helmet');
const cors = require('cors');

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
app.use(helmet.default());

const limiter = rateLimit.default({
  limit: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

const hpp = require('hpp');
const sanitizationMiddleware = require('./utils/sanitize');

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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) Routes
app.use('/api/v1/tours', tourRourter);
app.use('/api/v1/users', userRourter);
app.use('/api/v1/reviews', reviewRourter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
