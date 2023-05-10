const stripe = require('stripe')(process.env.STRIPE_SECRET);

const Plan = require('../model/planModel');
const User = require('../model/userModel');
const handleFactory = require('../controllers/handleFactory');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');

// get All Plans
exports.getPlans = handleFactory.getAll(Plan);

exports.getCheckoutSession = catchAsync(async function (req, res, next) {
  //   Get Plan
  const { planId } = req.params;
  const plan = await Plan.findById(planId);

  if (!plan) return next(AppError('No plan with this ID.', 404));

  // Create a checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/`,
    cancel_url: `${req.protocol}://${req.get('host')}/pricing`,
    customer_email: req.user.email,
    payment_method_types: ['card'],
    client_reference_id: planId,
    currency: 'eur',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: plan.price * 100,
          product_data: {
            name: plan.name,
            // description: 'Subscription to our feature',
          },
        },
        quantity: 1,
      },
    ],
  });

  // send sesstion to the client
  res.status(200).json({ status: 'success', session });
});

exports.handleWebhook = function (req, res, next) {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') updateUserPlan(event.data.object, res);
  res.send();
};

async function updateUserPlan(session) {
  const planId = session.client_reference_id;
  const user = await User.findOne({ email: session.customer_email });

  user.subscription = planId;

  await user.save({ validateBeforeSave: false });
}

// app.post('/webhook', express.raw({ type: 'application/json' }), (request, response) => {
// });
