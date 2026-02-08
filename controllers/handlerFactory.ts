import { Request, Response, NextFunction } from 'express';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';
import pool from './../db.js';
import APIFeatures from './../utils/apiFeatures.js';
import { User, Tour, Review } from './../types';

type AllowedTables = 'tours' | 'reviews' | 'users';
type Model = User | Tour | Review;

const ALLOWED_TABLES: AllowedTables[] = ['tours', 'reviews', 'users'];

export const deleteOne = (table: AllowedTables) =>
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

export const updateOne = (table: AllowedTables, allowedFields: string[] = []) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    // 1) Filter body (security)
    const body: { [key: string]: any } = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        body[field] = req.body[field];
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
    const doc: Model = result.rows[0];

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

export const createOne = (
  table: AllowedTables,
  allowedFields: string[] = [],
  jsonbFields: string[] = [],
) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data: { [key: string]: any } = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field];
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
      if (jsonbFields.includes(key)) {
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
        [table.slice(0, -1)]: result.rows[0],
      },
    });
  });

export const getOne = (table: AllowedTables, options: { path?: string } = {}) =>
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    const { id } = req.params;
    let doc: Model;
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

export const getAll = (
  table: AllowedTables,
  options: { select?: string[]; virtuals?: (doc: any) => any } = {},
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
        [table]: result.rows,
      },
    });
  });
