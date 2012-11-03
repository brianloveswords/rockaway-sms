const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  number: { type: String, required: true}
})

const Subscription = db.model('Subscription', SubscriptionSchema);
module.exports = SubscriptionSchema;