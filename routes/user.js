var User = require('../models/user');

// Endpoints
// ---------

exports.announce = function announce(req, res) {
  const message = req.body.message;
  if (!message)
    res.send(400, 'need to set a message');
  User.broadcast(message, function (err, users) {
    if (err)
      return res.send(500, err);
    req.flash('success', 'Announcement sent!');
    return res.redirect('/');
  });
};

exports.dismissLatest = function dismissLatest(req, res) {
  const user = req.user;
  user.requiresAttention = false;
  user.save(function (err) {
    if (err)
      return res.send(500, err);
    req.flash('Latest message from <strong>' + user.number + '</strong> hidden.');
    return res.redirect('back');
  })
};

exports.reply = function reply(req, res) {
  const message = req.body.message;
  const user = req.user;
  if (!message)
    res.send(400, 'need to set a message');
  user.sendReply({ body: message }, function (err) {
    if (err)
      return res.send(500, err);
    req.flash('success', 'Reply sent. It may take a few seconds to get to the user\'s phone.')
    return res.redirect('back');
  })
};


// Middleware
// ----------

exports.getSubscribers = function getSubscribers (options) {
  return function (req, res, next) {
    User.findSubscribers(function (err, subscribers) {
      if (err)
        return next(err);
      req.subscribers = subscribers;
      return next();
    });
  }
};

exports.getNeedy = function getNeedy (options) {
  return function (req, res, next) {
    User.findNeedy(function (err, users) {
      if (err)
        return next(err);
      req.users = users;
      return next();
    });
  }
};

exports.getAll = function getAll (options) {
  options = options || {};

  const exclude = (
    (options.exclude || []).reduce(function (acc, thing) {
      acc[thing] = 0;
      return acc;
    }, {})
  );

  return function (req, res, next) {
    User.find({}, exclude, function (err, users) {
      if (err)
        return next(err);
      req.users = users;
      return next();
    });
  }
};

exports.getById = function getById(field) {
  return function (req, res, next) {
    const callback = foundUser(req, res, next);
    const id = req.param(field);
    User.findById(id, callback);
  };
}

exports.getByPhone = function getById(field) {
  return function (req, res, next) {
    const callback = foundUser(req, res, next);
    const number = req.query[field];
    const query = { number: '+' + number };
    User.findOne(query, callback);
  };
};

function foundUser(req, res, next) {
  return function (err, user) {
    if (err)
      return next(err);
    if (!user)
      return res.send(404, { 'error': 'Not found' });
    req.user = user;
    return next();
  }
}

