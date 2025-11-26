exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: "fail",
      message: "missing name or price",
    });
  }

  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    // requestedAt: req.requestTime,

    // results: tours.length
    // data: {
    //   tours,
    // },
  });
};
exports.createTour = (req, res) => {
  res.status(200).json({
    status: "success",
    tour: req.body,
  });
};

exports.getTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
};

exports.updateTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
};

exports.deleteTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
};
