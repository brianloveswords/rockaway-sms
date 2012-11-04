var Message = require('../models/message');
// Middleware
// ----------
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

exports.getFromParam = function getFromParam (name) {
  return function (req, res, next) {
    var id = req.param(name);
    Message.findById(id, function (err, message) {
      if (err)
        return next(err);
      if (!message)
        return res.send(404);
      req.message = message;
      return next();
    });
  }
};

// Routes
// ------
exports.dismiss = function dismiss (req, res, next) {
  var message = req.message;
  message.type = 'dismissed';
  message.save(function (err) {
    if (err) {
      logger.error(err.message, err);
      return next(err);
    }
    return res.redirect(303, '/');
  });
};
