const Twilio = require('../twilio');
const logger = require('../logger');
const Subscription = require('../models/subscription');

exports.getAll = function getAll (options) {
  return function (req, res, next) {
    Subscription.find(function (err, subscribers) {
      if (err)
        return (err.code = 500, next(err));
      req.subscribers = subscribers;
      return next();
    });
  }
};

exports.announce = function announce(req, res, next) {
  var message = req.body['message'];
  var numbers = req.subscribers.map(function (sub) {
    return sub.number;
  });
  if (!message)
    return res.send('You need to enter a message to send');

  Twilio.SMS.announce(numbers, message.trim())
  logger.info('sending message to ' + numbers.length + ' numbers: ' + message);
  return res.redirect('/');
};