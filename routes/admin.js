const env = require('../env');
const persona = require('../persona');
const logger = require('../logger');
const Admin = require('../models/admin')
const Exemptions = require('../exemptions');
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

// Middleware
// ----------

exports.checkAuth = function checkAuth(options) {
  options = options || {};
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
      if (admin.isOwner())
        return next();
      console.dir(admin);
      return res.redirect(redirect);
    });
  };
}