const pool = require('../db');

// For learning purposes
module.exports = async function calcTourRatings(tourId) {
  const statsSql = `
    SELECT
      COUNT(*)::int AS ratings_quantity,
      COALESCE(AVG(rating), 4.5) AS avg_rating
    FROM reviews
    WHERE tour_id = $1
  `;

  const stats = await pool.query(statsSql, [tourId]);

  const { ratings_quantity, avg_rating } = stats.rows[0];

  const updateTourSql = `
    UPDATE tours
    SET
      ratings_quantity = $1,
      rating = $2
    WHERE id = $3
  `;

  await pool.query(updateTourSql, [ratings_quantity, avg_rating, tourId]);
};
