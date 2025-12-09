const express = require('express');
const morgan = require('morgan');

const tourRourter = require('./routes/tourRoutes');
const userRourter = require('./routes/userRoutes');

const app = express();

// 1) Global Middlewares
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) Routes
app.use('/api/v1/tours', tourRourter);
app.use('/api/v1/users', userRourter);

app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`,
  });

  next();
});

module.exports = app;
