import dotenv from 'dotenv';

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  if (err instanceof Error) {
    console.log('ERROR!!!', err.name, err.message);
  } else {
    console.log('ERROR!!!', err);
  }
  process.exit(1);
});

dotenv.config({ path: './config.env', override: true });

import app from './app.js';
import pool from './db.js';

// test db connection
pool.query('SELECT 1').then(() => console.log('DB connected'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANLED REJECTION! Shutting down...');
  if (err instanceof Error) {
    console.log('ERROR!!!', err.name, err.message);
  } else {
    console.log('ERROR!!!', err);
  }
  server.close(() => {
    process.exit(1);
  });
});
