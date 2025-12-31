const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const pool = require('./../db');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const sql = `DELETE FROM ${Model} WHERE id = $1`;
    const values = [id];
    const result = await pool.query(sql, values);

    if (result.rowCount === 0) {
      return next(new AppError(`No document found with ID: ${id}`));
    }

    res.status(200).json({
      status: 'success',
      message: `delted one from ${Model} successfully `,
    });
  });
