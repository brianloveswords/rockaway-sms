var Subscription = require('../models/subscription');
exports.getAll = function getAll (req, res, next) {
  Subscription.find(function (err, subscribers) {
    if (err)
      return (err.code = 500, next(err));
    req.subscribers = subscribers;
    return next();
  });
};
