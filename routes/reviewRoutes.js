const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({
  mergeParams: true,
});

// POST /tour/fdksf34/reviews
// GET /tour/fdksf34/reviews
// POST /reviews

router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
