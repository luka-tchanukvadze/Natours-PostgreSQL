const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const pool = require('./db');

// test db connection
pool.query('SELECT 1').then(() => console.log('DB connected'));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDED REJECTION! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
