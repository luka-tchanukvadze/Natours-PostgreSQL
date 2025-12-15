const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');

const AppError = require('./../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    photo,
    role,
    password,
    password_confirm,
    password_changed_at,
    password_reset_token,
    password_reset_expires,
    active,
  } = req.body;

  const sql = `
  INSERT INTO users (
    name,
    email,
    photo,
    role,
    password,
    password_confirm,
    password_changed_at,
    password_reset_token,
    password_reset_expires,
    active
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  )
  RETURNING *;
`;

  const values = [
    name,
    email,
    photo,
    role,
    password,
    password_confirm,
    password_changed_at,
    password_reset_token,
    password_reset_expires,
    active,
  ];

  const result = await pool.query(sql, values);
  const newUser = result.rows[0];

  res.status(200).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
