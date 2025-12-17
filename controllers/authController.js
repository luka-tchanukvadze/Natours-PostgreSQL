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

const correctPassword = async (candidatePassword, userPassword) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const signToken = (id) => {
  return jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
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

  const token = signToken(newUser.id);

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 404));
  }

  // 2) Check if user exists && password is correct
  const sql = `
    SELECT id, name ,email, password, role
    FROM users
    WHERE email = $1
  `;

  const values = [email];

  const result = await pool.query(sql, values);
  const user = result.rows[0];

  // check user and Compare Password
  if (!user || !(await correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  // Remove password before sending
  delete user.password;

  // 3) If everything ok, send token to client
  const token = signToken(user.id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
