const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  }
})

const Subscription = db.model('Subscription', SubscriptionSchema);

Subscription.add = function add(number, callback) {
  const DUPLICATE_CODE = 11000;
  var sub = new Subscription({ number: number });
  sub.save(function (err) {
    if (err) {
      if (err.code === DUPLICATE_CODE)
        return callback(null, false);
      return callback(err);
    }
    return callback(null, true);
  });
};

Subscription.remove = function remove(number, callback) {
  Subscription.findOneAndRemove({ number: number }, function (err, result) {
    if (err)
      return callback(err);
    return callback(null, !!result);
  });
};

module.exports = Subscription;