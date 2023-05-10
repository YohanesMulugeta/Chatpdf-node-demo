const express = require('express');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.isLogedin, authController.signUp);
router.route('/login').post(authController.logIn);

// TODO: CHECK
// router.route('/signUpInWithGoogle').post(authController.signUpInWithGoogle);

router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/verifyemail/:token').get(authController.verifyEmail);

router.route('/resetpassword/:token').post(authController.resetPassword);

router.use(authController.protect);

router.route('/logout').get(authController.logout);
router.route('/me').get(authController.getMe);
router.route('/updatepassword').patch(authController.updatePassword);
router.route('/updateMe').post(authController.updateMe);

// TODO: STATS
router.route('/stats').get(userController.getStat);

router.use(authController.strictTo('admin', 'dev'));

// Admin
router.route('/').get(userController.getAllUsers).delete(userController.deleteAll);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
