const express = require('express');

const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/resetpassword/:token', viewController.resetPassword);

router.use(authController.isLogedin);

router.route('/').get(viewController.home);
router.route('/about').get(viewController.about);
router.route('/pricing').get(viewController.pricing);
router.route('/register').get(viewController.register);
router.route('/login').get(viewController.login);
router.route('/features/:feature').get(viewController.feature);
router.route('/features').get(viewController.features);
router.route('/terms').get(viewController.terms);

router.route('/error').get(viewController.error);

router.route('/profile').get(authController.protect, viewController.profile);

router.use(authController.protect, authController.strictTo('dev', 'admin'));
router.route('/admin/users').get(adminController.users);

module.exports = router;
