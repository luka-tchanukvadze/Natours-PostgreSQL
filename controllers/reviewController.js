const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

/**
 * Allow nested routes
 * /tours/:tourId/reviews
 */
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour_id) req.body.tour_id = req.params.tourId;
  if (!req.body.user_id) req.body.user_id = req.user.id;
  next();
};

exports.createReview = factory.createOne('reviews', [
  'review',
  'rating',
  'tour_id',
  'user_id',
]);
exports.updateReview = factory.updateOne('reviews', ['review', 'rating']);
exports.getReview = factory.getOne('reviews');
exports.deleteReview = factory.deleteOne('reviews');

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

// exports.getReview = catchAsync(async (req, res, next) => {
//   const sql = `
//     SELECT
//       r.*,
//       u.name AS user_name,
//       u.photo AS user_photo
//     FROM reviews r
//     JOIN users u ON r.user_id = u.id
//     WHERE r.id = $1
//   `;

//   const result = await pool.query(sql, [req.params.id]);

//   if (!result.rows[0]) {
//     return next(new AppError('No review found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       review: result.rows[0],
//     },
//   });
// });
