import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: './config.test.env' });
} else {
  dotenv.config({ path: './config.env' });
}

// Determine which database configuration to use
let dbConfig: PoolConfig;

if (process.env.NODE_ENV === 'test') {
  if (!process.env.TEST_DATABASE_URL) {
    throw new Error('TEST_DATABASE_URL is not defined for test environment');
  }
  dbConfig = {
    connectionString: process.env.TEST_DATABASE_URL,
  };
} else {
  if (!process.env.DB_PASSWORD) {
    throw new Error('DB_PASSWORD is not defined for development/production');
  }
  dbConfig = {
    user: 'postgres',
    host: '127.0.0.1',
    database: 'natourspsql',
    password: process.env.DB_PASSWORD,
    port: 5432,
  };
}

const pool = new Pool(dbConfig);

export default pool;
