import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env', override: true });

if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD is not defined');
}

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'natourspsql',
  password: process.env.DB_PASSWORD,
  port: 5432,
});

export default pool;
