const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const { validate } = require('./../utils/validators/validate');
const { userSchema } = require('./../utils/validators/userSchema');

const router = express.Router();

router.post('/signup', validate(userSchema), authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
