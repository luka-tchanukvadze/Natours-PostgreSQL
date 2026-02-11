import { Request, Response, NextFunction } from 'express';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import pool from './../db.js';
import APIFeatures from './../utils/apiFeatures.js';
import { User, Tour, Review } from './../types';

type AllowedTables = 'tours' | 'reviews' | 'users';

type TableToModel = {
  tours: Tour;
  reviews: Review;
  users: User;
};

// A utility type to extract the request body type for a given model
type RequestBody<T extends AllowedTables> = Partial<
  Omit<
    TableToModel[T],
    | 'id'
    | 'created_at'
    | 'password_changed_at'
    | 'password_reset_token'
    | 'password_reset_expires'
    | 'active'
    | 'reviews'
  >
>; // Add more excluded fields as needed

const ALLOWED_TABLES: AllowedTables[] = ['tours', 'reviews', 'users'];

export const deleteOne = <T extends AllowedTables>(table: T) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    const sql = `DELETE FROM ${table} WHERE id = $1`;
    const result = await pool.query(sql, [req.params.id]);

    if (result.rowCount === 0) {
      return next(
        new AppError(`No document found with ID: ${req.params.id}`, 404),
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = <T extends AllowedTables>(
  table: T,
  allowedFields: (keyof RequestBody<T>)[] = [],
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    // 1) Filter body (security)
    const body: Partial<RequestBody<T>> = {};
    allowedFields.forEach((field) => {
      if (req.body[field as string] !== undefined) {
        body[field] = req.body[field as string];
      }
    });

    if (Object.keys(body).length === 0) {
      return next(new AppError('No valid fields provided to update', 400));
    }

    // 2) Build SET clause dynamically
    const setClause = Object.keys(body)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ');

    const values = Object.values(body);
    values.push(req.params.id); // last placeholder

    // 3) Execute query
    const sql = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $${values.length}
      RETURNING *;
    `;

    const result = await pool.query(sql, values);
    const doc: TableToModel[T] = result.rows[0];

    if (!doc) {
      return next(
        new AppError(`No document found with ID: ${req.params.id}`, 404),
      );
    }

    // 4) Response
    res.status(200).json({
      status: 'success',
      data: {
        [table.slice(0, -1)]: doc, // tours → tour
      },
    });
  });

export const createOne = <T extends AllowedTables>(
  table: T,
  allowedFields: (keyof RequestBody<T>)[] = [],
  jsonbFields: (keyof RequestBody<T>)[] = [],
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: Partial<RequestBody<T>> = {};

    allowedFields.forEach((field) => {
      if (req.body[field as string] !== undefined) {
        data[field] = req.body[field as string];
      }
    });

    if (Object.keys(data).length === 0) {
      return next(new AppError('No valid fields provided', 400));
    }

    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map((_, i) => `$${i + 1}`)
      .join(', ');

    const values = Object.entries(data).map(([key, val]) => {
      // stringify ONLY JSONB columns
      if (jsonbFields.includes(key as keyof RequestBody<T>)) {
        return JSON.stringify(val);
      }
      return val; // arrays stay arrays
    });

    const sql = `
      INSERT INTO ${table} (${columns})
      VALUES (${placeholders})
      RETURNING *;
    `;

    const result = await pool.query(sql, values);

    res.status(201).json({
      status: 'success',
      data: {
        [table.slice(0, -1)]: result.rows[0] as TableToModel[T],
      },
    });
  });

export const getOne = <T extends AllowedTables>(
  table: T,
  options: { path?: 'reviews' } = {},
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    const { id } = req.params;
    let doc: TableToModel[T];
    let sql = `SELECT * FROM ${table} WHERE id = $1`;

    // 1) Get main document
    const result = await pool.query(sql, [id]);
    doc = result.rows[0];

    if (!doc) {
      return next(new AppError(`No document found with ID: ${id}`, 404));
    }

    // 2) Populate (Postgres-style)
    if (options.path === 'reviews' && table === 'tours') {
      const reviewsSql = `
        SELECT
          r.*,
          u.name AS user_name,
          u.photo AS user_photo
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.tour_id = $1
      `;

      const reviewsResult = await pool.query(reviewsSql, [id]);
      (doc as Tour).reviews = reviewsResult.rows;
    }

    // 3) Send response
    res.status(200).json({
      status: 'success',
      data: {
        [table.slice(0, -1)]: doc, // tours -> tour
      },
    });
  });

export const getAll = <T extends AllowedTables>(
  table: T,
  options: {
    select?: (keyof TableToModel[T])[];
    virtuals?: (doc: TableToModel[T]) => any;
  } = {},
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    const select = options.select?.length > 0 ? options.select.join(', ') : '*';

    const features = new APIFeatures(table, req.query, select)
      .filter()
      .sort()
      .fields()
      .paginate();

    const result = await pool.query(features.sql, features.values);

    if (result.rows.length === 0 && Number(req.query.page) > 1) {
      return next(new AppError('This page does not exist', 404));
    }

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        [table]: result.rows as TableToModel[T][],
      },
    });
  });
