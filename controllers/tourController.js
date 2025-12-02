const pool = require('./../db');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '2';
  (req.query.sort = '-rating, price'),
    (req.fields = 'name,price,rating,summary,difficulty');

  next();
};

exports.getAllTours = async (req, res) => {
  try {
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

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { tours: result.rows },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    const {
      name,
      duration,
      max_group_size,
      rating,
      ratings_quantity,
      price,
      summary,
      description,
      image_cover,
      images,
      start_dates,
    } = req.body;

    const sql = `
      INSERT INTO tours (
        name, duration, max_group_size, rating, ratings_quantity, price,
        summary, description, image_cover, images, start_dates
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `;

    const values = [
      name,
      duration,
      max_group_size,
      rating || 4.5,
      ratings_quantity || 0,
      price,
      summary,
      description,
      image_cover,
      images || [],
      start_dates || [],
    ];

    const result = await pool.query(sql, values);
    const newTour = result.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        tours: newTour,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.getTour = async (req, res) => {
  const { id } = req.params;

  try {
    const sql = 'SELECT * FROM tours WHERE id = $1';
    const value = [id];
    const result = await pool.query(sql, value);
    const tour = result.rows[0];

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: `No tour found with ID ${id}`,
      });
    }

    res.status(200).json({
      status: 'success',
      data: tour,
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.updateTour = async (req, res) => {
  try {
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

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `DELETE FROM tours WHERE id = $1`;
    const values = [id];
    await pool.query(sql, values);

    res.status(200).json({
      status: 'success',
      message: 'Tour successfully deleted',
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price || !req.body.rating) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'missing name or price',
//     });
//   }

//   next();
// };
