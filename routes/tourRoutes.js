const express = require('express');
const tourController = require('./../controllers/tourController');
const { tourSchema } = require('./../utils/validators/tourSchema');
const { validate } = require('./../utils/validators/validate');

const router = express.Router();

router
  .route('/top-2-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(validate(tourSchema), tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
