var Message = require('../models/message');
exports.getAll = function getAll (filter) {
  filter = filter || {};
  return function (req, res, next) {
    Message.find(filter, function (err, messages) {
      if (err)
        return (err.code = 500, next(err));
      req.messages = messages;
      return next();
    });
  }
};
