import pg from 'pg';
import dotenv from 'dotenv';

// Ensure dotenv is configured if not already
dotenv.config({ path: './config.env', override: true });

const pool = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'natourspsql',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export default pool;
