const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const pool = require('./../db');

const ALLOWED_TABLES = ['tours', 'reviews', 'users'];

exports.deleteOne = (table) =>
  catchAsync(async (req, res, next) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    const sql = `DELETE FROM ${table} WHERE id = $1`;
    const result = await pool.query(sql, [req.params.id]);

    if (result.rowCount === 0) {
      return next(
        new AppError(`No document found with ID: ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
