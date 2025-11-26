const express = require("express");

const app = express();

app.use(express.json());

app.get("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    // results: tours.length
    // data: {
    //   tours,
    // },
  });
});

app.post("/api/v1/tours", (req, res) => {
  res.status(200).json({
    status: "success",
    tour: req.body,
  });
});

app.get("/api/v1/tours/:id", (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
});

app.patch("/api/v1/tours/:id", (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
});

app.delete("/api/v1/tours/:id", (req, res) => {
  const { id } = req.params * 1;

  // const tour = tours.find((el) => el.id === id);

  res.status(200).json({
    status: "success",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`App running on port ${PORT}...`);
});
