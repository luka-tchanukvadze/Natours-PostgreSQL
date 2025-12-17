const jwt = require('jsonwebtoken');

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

  const { name, email, photo, password } = userData;

  const sql = `
    INSERT INTO users (
      name,
      email,
      photo,
      password
    ) VALUES (
      $1, $2, $3, $4
    )
    RETURNING *;
  `;

  const values = [name, email, photo, password];

  const result = await pool.query(sql, values);
  const newUser = result.rows[0];

  const token = jwt.sign(
    {
      id: newUser.id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
