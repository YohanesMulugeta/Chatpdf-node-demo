const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan must have a name'],
    unique: true,
    lowercase: true,
  },
  price: { type: Number, required: [true, 'Plan must have a price'] },
  //   pricePerY: { type: Number, required: [true, 'Plan must have a price'] },
  tokenLimit: { type: Number, required: [true, 'Plan must have a Token limit'] },
  description: {
    type: String,
    // required: [true, 'Plan must have description']
  },
});

planSchema.pre(/^find/, function (next) {
  this.sort('-price');

  next();
});

const Plan = mongoose.model('plan', planSchema);

module.exports = Plan;
