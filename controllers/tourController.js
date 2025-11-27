const pool = require('./../db');

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    // requestedAt: req.requestTime,

    // results: tours.length
    // data: {
    //   tours,
    // },
  });
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

exports.getTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: 'success',
  });
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
