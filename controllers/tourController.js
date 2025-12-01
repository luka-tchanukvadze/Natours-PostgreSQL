const pool = require('./../db');

exports.getAllTours = async (req, res) => {
  try {
    const queryObj = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let sql = 'SELECT * FROM tours';
    let conditions = [];
    let values = [];
    let index = 1;

    // FILTERING
    for (const key in queryObj) {
      const value = queryObj[key];

      if (typeof value === 'object') {
        // Handle nested filters: duration[gte], price[lte], etc.
        for (const op in value) {
          const operatorMap = {
            gte: '>=',
            gt: '>',
            lte: '<=',
            lt: '<',
          };

          const operator = operatorMap[op];
          if (!operator) continue;

          conditions.push(`${key} ${operator} $${index}`);
          values.push(value[op]);
          index++;
        }
      } else {
        // Normal equality filter: ?duration=5
        conditions.push(`${key} = $${index}`);
        values.push(value);
        index++;
      }
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }

    // SORT
    if (req.query.sort) {
      const sortBy = req.query.sort
        .split(',')
        .map((field) =>
          field.startsWith('-') ? `${field.slice(1)} DESC` : `${field} ASC`
        )
        .join(', ');

      sql += ` ORDER BY ${sortBy}`;
    }

    const result = await pool.query(sql, values);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: { tours: result.rows },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: 'fail', message: error.message });
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
