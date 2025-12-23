const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

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

const changedPasswordAfter = (JWTTimestamp, user) => {
  if (user.password_changed_at) {
    const changedTimestamp = Math.floor(
      new Date(user.password_changed_at).getTime() / 1000
    );
    const changedAfter = JWTTimestamp < changedTimestamp;
    return changedAfter;
  }

  return false;
};

const createPasswordResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log(resetToken, hashedToken);
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  return { resetToken, hashedToken, expires };
};

//////////////////////////////////
//////////////////////////////////

////////  http methods  //////////

//////////////////////////////////
//////////////////////////////////

exports.signup = catchAsync(async (req, res, next) => {
  const userData = await hashPasswordIfModified(req.body);

  const { name, email, photo, password, role } = userData;

  const sql = `
    INSERT INTO users (
      name,
      email,
      photo,
      password,
      role
    ) VALUES (
      $1, $2, $3, $4, $5
    )
    RETURNING *;
  `;

  const values = [name, email, photo, password, role];

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

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of if it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const sql = `
    SELECT id, name, email, role, password_changed_at
    FROM users
    WHERE id = $1
  `;

  const values = [decoded.id];

  const result = await pool.query(sql, values);
  const currentUser = result.rows[0];

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (changedPasswordAfter(decoded.iat, currentUser)) {
    return next(
      new AppError('User recently changed password. Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  // 1) Get user based on POSTed email

  if (!email) {
    return next(new AppError('There is no user with this email address', 404));
  }

  const sql = `
    SELECT id, name, email, password, role
    FROM users
    WHERE email = $1
  `;

  const values = [email];

  const result = await pool.query(sql, values);
  const currentUser = result.rows[0];

  // 2) Generate the random reset token
  const { resetToken, hashedToken, expires } = createPasswordResetToken();

  await pool.query(
    `
  UPDATE users
  SET password_reset_token = $1,
      password_reset_expires = $2
  WHERE id = $3
  `,
    [hashedToken, expires, currentUser.id]
  );
  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new passwod and passwordCOnfirm to: ${resetURL}/\n if you didn't forget your password, please ignore this email!`;

  await sendEmail({
    email: user.email,
    subject: 'Your password reset token (valid for 10min)',
    message,
  });

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

exports.resetPassword = (req, res, next) => {};
