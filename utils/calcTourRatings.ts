import { Pool } from 'pg';
import pool from '../db.js';

interface TourStats {
  ratings_quantity: number;
  avg_rating: number;
}

// For learning purposes
export default async function calcTourRatings(tourId: number): Promise<void> {
  const statsSql = `
    SELECT
      COUNT(*)::int AS ratings_quantity,
      COALESCE(AVG(rating), 4.5) AS avg_rating
    FROM reviews
    WHERE tour_id = $1
  `;

  const stats = await pool.query<TourStats>(statsSql, [tourId]);

  const { ratings_quantity, avg_rating } = stats.rows[0];

  const updateTourSql = `
    UPDATE tours
    SET
      ratings_quantity = $1,
      rating = $2
    WHERE id = $3
  `;

  await pool.query(updateTourSql, [ratings_quantity, avg_rating, tourId]);
}
