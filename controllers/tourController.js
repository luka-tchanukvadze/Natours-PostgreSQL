const pool = require('./../db');

exports.getAllTours = async (req, res) => {
  try {
    const sql = 'SELECT * FROM tours';

    const result = await pool.query(sql);
    const allTours = result.rows;

    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: {
        tours: allTours,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

exports.createTour = async (req, res) => {
  try {
    const { name, rating, price } = req.body;

    const sql =
      'INSERT INTO tours (name, rating, price) VALUES($1, $2, $3) RETURNING *';
    const values = [name, rating, price];

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

exports.updateTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
  });
};

exports.deleteTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
  });
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
