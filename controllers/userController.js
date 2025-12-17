const pool = require('./../db');
const catchAsync = require('./../utils/catchAsync');

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
