const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');
const pool = require('./db');

// test db connection
pool
  .query('SELECT 1')
  .then(() => console.log('DB connected'))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
