import { Request, Response, NextFunction } from 'express';
import pool from './../db.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import * as factory from './handlerFactory.js';
import { User } from './../types';

//////////////////////////////////
//////// filter helper //////////
//////////////////////////////////

const filterObj = (
  obj: any,
  ...allowedFields: string[]
): { [key: string]: any } => {
  const newObj: { [key: string]: any } = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

//////////////////////////////////
//////// HTTP controllers ////////
//////////////////////////////////

// GET ALL USERS (only active users)

// export const getAllUsers = factory.getAll('users', {
//   select: ['id', 'name', 'email', 'photo', 'role', 'active'],
// });

export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
        users: result.rows as User[],
      },
    });
  },
);

export const getMe = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.params.id = req.user?.id;
  next();
};

export const updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
    values.push(req.user?.id);

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
    const updatedUser: User = result.rows[0];

    // 8) Send response
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  },
);

export const deleteMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sql = `
    UPDATE users
    SET active = FALSE
    WHERE id = $1
    RETURNING id
  `;

    await pool.query(sql, [req.user?.id]);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  },
);

export const getUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
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
        user: result.rows[0] as User,
      },
    });
  },
);

export const createUser = (req: Request, res: Response): void => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

export const updateUser = (req: Request, res: Response): void => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

export const deleteUser = (req: Request, res: Response): void => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};
