import pool from '../db';

export default async (): Promise<void> => {
  await pool.end();
};
