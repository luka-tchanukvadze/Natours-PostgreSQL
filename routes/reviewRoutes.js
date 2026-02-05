import express from 'express';
import * as reviewController from './../controllers/reviewController.js';
import * as authController from './../controllers/authController.js';
import * as factory from './../controllers/handlerFactory.js';

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
  .post(authController.restrictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview,
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    factory.deleteOne('reviews'),
  );

export default router;
