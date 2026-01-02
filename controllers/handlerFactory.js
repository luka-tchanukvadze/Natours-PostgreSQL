const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const pool = require('./../db');

const ALLOWED_TABLES = ['tours', 'reviews', 'users'];

exports.deleteOne = (table) =>
  catchAsync(async (req, res, next) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    const sql = `DELETE FROM ${table} WHERE id = $1`;
    const result = await pool.query(sql, [req.params.id]);

    if (result.rowCount === 0) {
      return next(
        new AppError(`No document found with ID: ${req.params.id}`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (table, allowedFields = []) =>
  catchAsync(async (req, res, next) => {
    if (!ALLOWED_TABLES.includes(table)) {
      return next(new AppError('Invalid table name', 400));
    }

    // 1) Filter body (security)
    const body = {};
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
    const doc = result.rows[0];

    if (!doc) {
      return next(
        new AppError(`No document found with ID: ${req.params.id}`, 404)
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

exports.createOne = (table, allowedFields = []) =>
  catchAsync(async (req, res, next) => {
    // 1) Filter only allowed fields
    const data = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    if (Object.keys(data).length === 0) {
      return next(new AppError('No valid fields provided', 400));
    }

    // 2) Build dynamic SQL
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data)
      .map((_, i) => `$${i + 1}`)
      .join(', ');

    // 3) Convert arrays/objects to JSON strings for JSONB fields
    const values = Object.values(data).map((val) =>
      Array.isArray(val) || typeof val === 'object' ? JSON.stringify(val) : val
    );

    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;

    // 4) Execute
    const result = await pool.query(sql, values);
    const doc = result.rows[0];

    // 5) Send response
    res.status(201).json({
      status: 'success',
      data: {
        [table.slice(0, -1)]: doc, // tours -> tour
      },
    });
  });
