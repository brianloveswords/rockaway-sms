var User = require('../models/user');
exports.getSubscribers = function getSubscribers (options) {
  return function (req, res, next) {
    User.findSubscribers(function (err, subscribers) {
      if (err)
        return (err.code = 500, next(err));
      req.subscribers = subscribers;
      return next();
    });
  }
};
