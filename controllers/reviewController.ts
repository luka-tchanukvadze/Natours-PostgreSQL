import { Request, Response, NextFunction } from 'express';
import pool from './../db.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import * as factory from './handlerFactory.js';
import { Review } from './../types';

/**
 * Allow nested routes
 * /tours/:tourId/reviews
 */
export const setTourUserIds = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.body.tour_id) req.body.tour_id = req.params.tourId;
  if (!req.body.user_id) req.body.user_id = req.user?.id;
  next();
};

export const createReview = factory.createOne('reviews', [
  'review',
  'rating',
  'tour_id',
  'user_id',
]);
export const updateReview = factory.updateOne('reviews', ['review', 'rating']);
export const getReview = factory.getOne('reviews');
export const deleteReview = factory.deleteOne('reviews');

export const getAllReviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let sql = `
    SELECT
      r.*,
      u.name AS user_name,
      u.photo AS user_photo
    FROM reviews r
    JOIN users u ON r.user_id = u.id
  `;
    const values: string[] = [];

    if (req.params.tourId) {
      sql += ` WHERE r.tour_id = $1`;
      values.push(req.params.tourId);
    }

    const result = await pool.query(sql, values);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        reviews: result.rows as Review[],
      },
    });
  },
);

// export const getReview = catchAsync(async (req, res, next) => {
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
