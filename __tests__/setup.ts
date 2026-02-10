import pool from '../db';
import { PoolClient } from 'pg';

// List of tables to truncate
const tablesToTruncate: string[] = ['tours', 'users', 'reviews', 'bookings'];

export default async (): Promise<void> => {
  console.log('process.env.NODE_ENV in setup.ts:', process.env.NODE_ENV); // Debug log
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Tests can only be run in the test environment!');
  }

  const client: PoolClient = await pool.connect();
  try {
    for (const table of tablesToTruncate) {
      await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
    }
  } catch (error) {
    console.error('Error during global setup:', error);
    throw error;
  } finally {
    client.release();
  }
};
