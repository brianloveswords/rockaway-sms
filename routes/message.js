var Message = require('../models/message');
exports.getAll = function getAll (opts) {
  opts.filter = opts.filter || {};
  return function (req, res, next) {
    Message.find(opts.filter, function (err, messages) {
      if (err)
        return (err.code = 500, next(err));
      req.messages = messages;
      return next();
    });
  }
};
