const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const sql = `
    SELECT id, name, email, photo, role, active
    FROM users
  `;
  const result = await pool.query(sql);

  if (!result.rows.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'No users',
    });
  }

  const users = result.rows;

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Prevent password updates on this route
  if (req.body.password || req.body.password_confirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // 2) Filter only allowed fields
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Build dynamic SQL for allowed fields
  const setClause = Object.keys(filteredBody)
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(', ');

  if (!setClause) {
    return next(new AppError('No valid fields provided to update.', 400));
  }

  const values = Object.values(filteredBody);
  values.push(req.user.id); // for WHERE id = $n

  const sql = `
    UPDATE users
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING id, name, email, photo, role, active
  `;

  const result = await pool.query(sql, values);
  const updatedUser = result.rows[0];

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
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
