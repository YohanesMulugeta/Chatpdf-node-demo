const express = require('express');

const authController = require('../controllers/authController');
const planController = require('../controllers/planController');

const router = express.Router();

router.route('/').get(planController.getPlans);
router.get(
  '/checkout-session/:planId',
  authController.protect,
  planController.getCheckoutSession
);

module.exports = router;
