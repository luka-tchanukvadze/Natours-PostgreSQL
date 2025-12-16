const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const bcrypt = require('bcryptjs');

////////////////////////////////////////
////////////////////////////////////////

////////  managing passwords  //////////

////////////////////////////////////////
////////////////////////////////////////

const hashPasswordIfModified = async (user) => {
  if (!user.password) return user;

  user.password = await bcrypt.hash(user.password, 12);
  user.password_confirm = null;

  return user;
};

//////////////////////////////////
//////////////////////////////////

////////  http methods  //////////

//////////////////////////////////
//////////////////////////////////

exports.signup = catchAsync(async (req, res, next) => {
  const userData = await hashPasswordIfModified(req.body);

  const {
    name,
    email,
    photo,
    role,
    password,
    password_changed_at,
    password_reset_token,
    password_reset_expires,
    active,
  } = userData;

  const sql = `
    INSERT INTO users (
      name,
      email,
      photo,
      role,
      password,
      password_changed_at,
      password_reset_token,
      password_reset_expires,
      active
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9
    )
    RETURNING *;
  `;

  const values = [
    name,
    email,
    photo,
    role,
    password,
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
