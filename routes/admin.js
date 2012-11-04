const persona = require('../persona');
const logger = require('../logger');

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
