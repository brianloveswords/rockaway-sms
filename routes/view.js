const env = require('../env');
const PHONE_NUMBER = env.get('twilioFrom');
const ORIGIN = env.get('origin');

function getCsrfToken(req) { return req.session._csrf }
function getPhoneNumber() { return PHONE_NUMBER }
function getAdmin(req) { return req.admin }
function getFlash(req) { return req.flash() }
function getOrigin(req) { return ORIGIN }

function each(obj, fn) {
  Object.keys(obj).forEach(function (k) {
    fn(k, obj[k]);
  });
};
function render(req, res) {
  return function (path, obj) {
    const base = {
      csrf: getCsrfToken(req),
      flash: getFlash(req),
      phone: getPhoneNumber(req),
      admin: getAdmin(req),
      origin: getOrigin(),
    };
    each(obj, function (k, v) { base[k] = v });
    return res.render(path, base);
  }
}

exports.login = function login (req, res) {
  render(req, res)('login.html', {
    page: 'login',
  });
};

exports.index = function index (req, res) {
  render(req, res)('index.html', {
    page: 'home',
    users: req.users,
  });
};
exports.announce = function announce (req, res) {
  res.render('announce.html', {
    csrf: getCsrfToken(req),
    flash: getFlash(req),
    phone: getPhoneNumber(req),
    admin: getAdmin(req),

    page: 'announce',
    subscribers: req.subscribers,
  });
};
exports.subscribers = function subscribers (req, res) {
  res.render('subscribers.html', {
    csrf: getCsrfToken(req),
    flash: getFlash(req),
    phone: getPhoneNumber(req),
    admin: getAdmin(req),

    page: 'subscribers',
    subscribers: req.subscribers,
  });
};
exports.user = function user(req, res) {
  const user = req.user;
  res.render('user.html', {
    csrf: getCsrfToken(req),
    flash: getFlash(req),
    phone: getPhoneNumber(req),
    admin: getAdmin(req),

    page: 'user',
    user: user,
    messages: user.messages.reverse(),
  });
};
