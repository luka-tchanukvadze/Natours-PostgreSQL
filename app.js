const express = require("express");

const app = express();

app.use(express.json());

const getAllTours = (req, res) => {
  res.status(200).json({
    status: "success",
    // results: tours.length
    // data: {
    //   tours,
    // },
  });
};
const createTour = (req, res) => {
  res.status(200).json({
    status: "success",
    tour: req.body,
  });
};

const getTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
};

const updateTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
};

const deleteTour = (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
};

app.route("/api/v1/tours").get(getAllTours).post(createTour);
app
  .route("/api/v1/tours/:id")
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
