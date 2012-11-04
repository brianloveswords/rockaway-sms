const env = require('../env');
const persona = require('../persona');
const logger = require('../logger');
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
  return function (req, res, next) {
    const admin = req.session.admin;
    if (!admin || req.url === redirect || whitelist.check(req.url))
      return next();
    if (admin === owner)
      return next();
    return res.redirect(redirect);
  };
}