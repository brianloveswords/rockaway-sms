const env = require('../env');
const persona = require('../persona');
const logger = require('../logger');
const Admin = require('../models/admin')
const Exemptions = require('../exemptions');
const util = require('util');
const OWNER = env.get('owner');
// Endpoints
// ---------
exports.login = function login(req, res) {
  const assertion = req.body.assertion;
  persona.verify(assertion, function (err, email) {
    if (err) {
      logger.warn('Login error: ' + err.message, err);
      req.flash('error', 'Something went wrong! Please try again');
      return res.redirect('back');
    }
    req.session.admin = email;
    return res.redirect('/');
  });
};

exports.logout = function logout(req, res) {
  delete req.session.admin;
  res.redirect('/login');
};


function callbackGenerator(req, res, action) {
  const user = req.user;
  const format = 'User <em>%s</em> has been %s.';
  const message = util.format(format, user.email, action);
  return function (err) {
    if (err) {
      logger.error('error when updating user: ', err.message, err);
      res.send(500, err);
    }
    req.flash('success', message);
    return res.redirect('back');
  }
}

exports.create = function create(req, res) {
  const email = req.body.email;

  function callback(err, user) {
    if (err) {
      logger.error('error when updating user: ', err.message, err);
      res.send(500, err);
    }
    req.flash('success', 'User ' + email + ' has been created.');
    return res.redirect('back');
  }

  Admin.findOneAndUpdate(
    {email: email},
    {level: 'admin'},
    {upsert: true },
    callback
  )
};

exports.update = function update(req, res) {
  const callback = callbackGenerator(req, res, 'updated');
  const level = req.body.level;
  req.user.changeLevel(level, callback);
};

exports.remove = function remove(req, res) {
  const callback = callbackGenerator(req, res, 'removed');
  req.user.remove(callback);
};

// Middleware
// ----------
exports.getById = function getById(options) {
  return function (req, res, next) {
    const id = req.param('id');
    Admin.findById(id, function (err, admin) {
      if (err)
        return next(err);
      if (!admin)
        return res.send(404);
      req.user = admin;
      return next();
    });
  }
};

exports.getAll = function getAll(options) {
  const query = { };
  return function (req, res, next) {
    Admin.find(query, function (err, admins) {
      if (err)
        return next(err);
      req.admins = admins;
      return next();
    });
  }
};


exports.checkAuth = function checkAuth(options) {
  options = options || {};
  const requiredLevel = options.level || 'admin';
  const whitelist = new Exemptions(options.whitelist);
  const owner = env.get('owner');
  const redirect = options.redirect || '/unauthorized';

  function findByEmail(email, callback) {
    const query = {
      email: email,
      owner: (email === OWNER)
    }
    Admin.findOrCreate(query, callback);
  }

  return function (req, res, next) {
    if (!req.session.admin ||
        req.url === redirect ||
        whitelist.check(req.url))
      return next();

    const email = req.session.admin;
    const admin = findByEmail(email, function (err, admin) {
      if (err)
        return next(err);
      req.currentAdmin = admin;
      if (admin.hasAccess(requiredLevel))
        return next();
      return res.redirect(redirect);
    });
  };
}