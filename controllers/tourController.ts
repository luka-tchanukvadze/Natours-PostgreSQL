import { Request, Response, NextFunction } from 'express';
import pool from './../db.js';
import APIFeatures from './../utils/apiFeatures.js';
import catchAsync from './../utils/catchAsync.js';
import AppError from './../utils/appError.js';

import * as factory from './handlerFactory.js';
import { Tour } from './../types';

export const aliasTopTours = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  req.query.limit = '2';
  req.query.sort = '-rating, price';
  req.query.fields = 'name,price,rating,summary,difficulty';

  next();
};

export const getAllTours = factory.getAll('tours', {
  virtuals: (tour: Tour) => ({
    ...tour,
    duration_in_weeks: tour.duration / 7,
  }),
});

export const createTour = factory.createOne(
  'tours',
  [
    'name',
    'duration',
    'max_group_size',
    'rating',
    'ratings_quantity',
    'price',
    'price_discount',
    'summary',
    'description',
    'image_cover',
    'images',
    'start_dates',
    'slug',
    'difficulty',
    'secret_tour',
    'start_location_type',
    'start_location_coordinates',
    'start_location_address',
    'start_location_description',
    'locations',
    'guides',
  ],
  ['locations'], // JSONB fields only
);
export const getTour = factory.getOne('tours', { path: 'reviews' });
export const updateTour = factory.updateOne('tours', [
  'name',
  'rating',
  'price',
]);
export const deleteTour = factory.deleteOne('tours');

export const getTourStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const sql = `
      SELECT
        difficulty,
        COUNT(*) AS total_tours,
        AVG(rating) AS avg_rating,
        AVG(price) AS avg_price,
        MIN(price) AS min_price,
        MAX(price) AS max_price
      FROM tours
      WHERE rating >= 4.5
      GROUP BY difficulty
      ORDER BY difficulty;
    `;
    const result = await pool.query(sql);
    const stats: any[] = result.rows; // TODO: Define a specific interface for TourStats

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  },
);

export const getMonthlyPlan = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const year = Number(req.params.year);

    const sql = `
      SELECT
        EXTRACT(MONTH FROM sd) AS month,
        COUNT(*) AS num_tour_starts,
        ARRAY_AGG(t.name) AS tours
      FROM tours t,
      UNNEST(t.start_dates) AS sd
      WHERE sd BETWEEN $1 AND $2
      GROUP BY month
      ORDER BY num_tour_starts DESC
      LIMIT 12;
    `;

    const values = [`${year}-01-01`, `${year}-12-31`];

    const result = await pool.query(sql, values);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: result.rows,
    });
  },
);

// /tours-within/:distance/center/:latlng/unit/:unit
// /tours-within/233/center/51.453789,-0.192270/unit/mi
// /tours-within/:distance/center/:latlng/unit/:unit
export const getToursWithin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = String(latlng).split(',').map(Number);

    if (!lat || !lng) {
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400,
        ),
      );
    }

    // Earth radius in miles or kilometers
    const earthRadius = unit === 'mi' ? 3958.8 : 6371;

    const sql = `
    SELECT *
    FROM tours
    WHERE (
      $4 * acos(
        cos(radians($1)) *
        cos(radians(start_location_coordinates[2])) *
        cos(radians(start_location_coordinates[1]) - radians($2)) +
        sin(radians($1)) *
        sin(radians(start_location_coordinates[2]))
      )
    ) <= $3
  `;

    const values = [lat, lng, distance, earthRadius];
    const result = await pool.query(sql, values);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        tours: result.rows as Tour[],
      },
    });
  },
);

// /distances/:latlng/unit/:unit
export const getDistances = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = String(latlng).split(',').map(Number);

    if (!lat || !lng) {
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
          400,
        ),
      );
    }

    // Earth radius in miles or kilometers
    const earthRadius = unit === 'mi' ? 3958.8 : 6371;

    const sql = `
    SELECT
      name,
      (
        $3 * acos(
          cos(radians($1)) *
          cos(radians(start_location_coordinates[2])) *
          cos(radians(start_location_coordinates[1]) - radians($2)) +
          sin(radians($1)) *
          sin(radians(start_location_coordinates[2]))
        )
      ) AS distance
    FROM tours
    ORDER BY distance ASC
  `;

    const values = [lat, lng, earthRadius];
    const result = await pool.query(sql, values);

    res.status(200).json({
      status: 'success',
      data: {
        data: result.rows,
      },
    });
  },
);

/*
Before Factory Function JS version

function addVirstuals(tour) {
  return {
    ...tour,
    duration_in_weeks: tour.duration / 7,
  };
}

export const getAllTours = catchAsync(async (req, res, next) => {
  const features = new APIFeatures('tours', req.query)
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await pool.query(features.sql, features.values);

  if (result.rows.length === 0 && req.query.page > 1) {
    return res.status(404).json({
      status: 'fail',
      message: 'This page does not exist',
    });
  }

  const toursWithVirtuals = result.rows.map(addVirstuals);

  res.status(200).json({
    status: 'success',
    results: result.rows.length,
    data: { tours: toursWithVirtuals },
  });
});





export const createTour = catchAsync(async (req, res, next) => {
  const {
    name,
    duration,
    max_group_size,
    rating,
    ratings_quantity,
    price,
    price_discount,
    summary,
    description,
    image_cover,
    images,
    start_dates,
    slug,
    difficulty,
    secret_tour,
    start_location_type,
    start_location_coordinates,
    start_location_address,
    start_location_description,
    locations,
    guides,
  } = req.body;

  const sql = `
      INSERT INTO tours (
        name, duration, max_group_size, rating, ratings_quantity, price, price_discount,
        summary, description, image_cover, images, start_dates, slug, difficulty,
        secret_tour, start_location_type, start_location_coordinates,
        start_location_address, start_location_description, locations, guides
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
      ) RETURNING *
    `;

  const values = [
    name,
    duration,
    max_group_size,
    rating || 4.5,
    ratings_quantity || 0,
    price,
    price_discount || 0,
    summary,
    description,
    image_cover,
    images || [],
    start_dates || [],
    slug,
    difficulty,
    secret_tour || false,
    start_location_type || 'Point',
    start_location_coordinates,
    start_location_address,
    start_location_description,
    JSON.stringify(locations), // Convert JS array/obj to JSON string for JSONB
    guides || [],
  ];

  const result = await pool.query(sql, values);
  const newTour = result.rows[0];

  res.status(201).json({
    // Changed to 201 for Created
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});




export const updateTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, rating, price } = req.body;

  const sql = `
      UPDATE tours
      SET
        name   = COALESCE($1, name),
        rating = COALESCE($2, rating),
        price  = COALESCE($3, price)
      WHERE id = $4
      RETURNING *;
    `;
  const values = [name, rating, price, id];
  const result = await pool.query(sql, values);

  const updatedTour = result.rows[0];

  if (!updatedTour) {
    return next(new AppError(`No tour found with ID: ${id}`));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour,
    },
  });
});




export const deleteTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const sql = `DELETE FROM tours WHERE id = $1`;
  const values = [id];
  const result = await pool.query(sql, values);

  if (result.rowCount === 0) {
    return next(new AppError(`No tour found with ID: ${id}`));
  }

  res.status(200).json({
    status: 'success',
    message: 'Tour successfully deleted',
  });
});

*/
