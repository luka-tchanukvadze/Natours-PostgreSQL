const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

/**
 * Allow nested routes
 * /tours/:tourId/reviews
 */
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour_id) req.body.tour_id = req.params.tourId;
  if (!req.body.user_id) req.body.user_id = req.user.id;
  next();
};

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let sql = `
    SELECT
      r.*,
      u.name AS user_name,
      u.photo AS user_photo
    FROM reviews r
    JOIN users u ON r.user_id = u.id
  `;
  const values = [];

  if (req.params.tourId) {
    sql += ` WHERE r.tour_id = $1`;
    values.push(req.params.tourId);
  }

  const result = await pool.query(sql, values);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      reviews: result.rows,
    },
  });
});

exports.getReview = catchAsync(async (req, res, next) => {
  const sql = `
    SELECT
      r.*,
      u.name AS user_name,
      u.photo AS user_photo
    FROM reviews r
    JOIN users u ON r.user_id = u.id
    WHERE r.id = $1
  `;

  const result = await pool.query(sql, [req.params.id]);

  if (!result.rows[0]) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: result.rows[0],
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating, tour_id, user_id } = req.body;

  const sql = `
    INSERT INTO reviews (review, rating, tour_id, user_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;

  const result = await pool.query(sql, [review, rating, tour_id, user_id]);

  res.status(201).json({
    status: 'success',
    data: {
      review: result.rows[0],
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { review, rating } = req.body;

  const sql = `
    UPDATE reviews
    SET
      review = COALESCE($1, review),
      rating = COALESCE($2, rating)
    WHERE id = $3
    RETURNING *
  `;

  const result = await pool.query(sql, [review, rating, req.params.id]);

  if (!result.rows[0]) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review: result.rows[0],
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const result = await pool.query(
    'DELETE FROM reviews WHERE id = $1 RETURNING *',
    [req.params.id]
  );

  if (!result.rows[0]) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
