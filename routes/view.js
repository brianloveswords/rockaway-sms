const env = require('../env');
const PHONE_NUMBER = env.get('twilioFrom');

function getCsrfToken(req) {
  return req.session._csrf;
}

exports.index = function index (req, res) {
  res.render('index.html', {
    page: 'home',
    csrf: getCsrfToken(req),
    flash: req.flash(),

    users: req.users,
    phone: PHONE_NUMBER,
  });
};
exports.announce = function announce (req, res) {
  res.render('announce.html', {
    page: 'announce',
    csrf: getCsrfToken(req),
    flash: req.flash(),

    subscribers: req.subscribers,
    phone: PHONE_NUMBER,
  });
};
exports.subscribers = function subscribers (req, res) {
  res.render('subscribers.html', {
    page: 'subscribers',
    csrf: getCsrfToken(req),
    flash: req.flash(),

    subscribers: req.subscribers,
    phone: PHONE_NUMBER,
  });
};
exports.user = function user(req, res) {
  const user = req.user;
  res.render('user.html', {
    page: 'user',
    csrf: getCsrfToken(req),
    flash: req.flash(),

    user: user,
    messages: user.messages.reverse(),
    phone: PHONE_NUMBER,
  });
};
