const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//////////////////////////////////
//////// filter helper //////////
//////////////////////////////////

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//////////////////////////////////
//////// HTTP controllers ////////
//////////////////////////////////

// GET ALL USERS (only active users)

// exports.getAllUsers = factory.getAll('users', {
//   select: ['id', 'name', 'email', 'photo', 'role', 'active'],
// });

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const sql = `
    SELECT id, name, email, photo, role, active
    FROM users
    WHERE active = TRUE
  `;
  const result = await pool.query(sql);

  if (!result.rows.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No active users',
    });
  }

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      users: result.rows,
    },
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Prevent password updates on this route
  // This route is only for updating name/email, not password.
  if (req.body.password || req.body.password_confirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400,
      ),
    );
  }

  // 2) Filter only allowed fields (name, email)
  // This ensures the user cannot update role, active, etc.
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Build dynamic SQL for allowed fields
  // Example: if filteredBody = {name: "John", email: "john@test.com"}
  // Then setClause = "name = $1, email = $2"
  const setClause = Object.keys(filteredBody)
    .map((key, idx) => `${key} = $${idx + 1}`) // $1, $2 are parameter placeholders
    .join(', ');

  // If user didn't send any allowed fields, throw error
  if (!setClause) {
    return next(new AppError('No valid fields provided to update.', 400));
  }

  // 4) Create array of values for SQL placeholders
  // Example: filteredBody = {name: "John", email: "john@test.com"}
  // values = ["John", "john@test.com"]
  const values = Object.values(filteredBody);

  // Add the user ID as the last value for the WHERE clause
  // It will be $n where n = values.length + 1
  values.push(req.user.id);

  // 5) Full SQL query
  // Example:
  // UPDATE users
  // SET name = $1, email = $2
  // WHERE id = $3
  // RETURNING id, name, email, photo, role, active
  const sql = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING id, name, email, photo, role, active
  `;

  // 6) Execute the query
  const result = await pool.query(sql, values);

  // 7) Get updated user
  const updatedUser = result.rows[0];

  // 8) Send response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const sql = `
    UPDATE users
    SET active = FALSE
    WHERE id = $1
    RETURNING id
  `;

  await pool.query(sql, [req.user.id]);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const sql = `
    SELECT id, name, email, photo, role, active
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(sql, [req.params.id]);

  if (!result.rows[0]) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: result.rows[0],
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
