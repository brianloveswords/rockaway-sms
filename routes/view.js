const env = require('../env');
const PHONE_NUMBER = env.get('twilioFrom');
const ORIGIN = env.get('origin');

function getCsrfToken(req) { return req.session._csrf }
function getPhoneNumber() { return PHONE_NUMBER }
function getAdmin(req) { return req.session.admin }
function getFlash(req) { return req.flash() }
function getOrigin(req) { return ORIGIN }

function each(obj, fn) {
  Object.keys(obj).forEach(function (k) {
    fn(k, obj[k]);
  });
};

exports.template = function template(options) {
  return function (req, res, next) {
    res.template = function (path, obj) {
      const templateVars = {
        csrf: getCsrfToken(req),
        flash: getFlash(req),
        phone: getPhoneNumber(req),
        admin: getAdmin(req),
        origin: getOrigin(),
      };
      each(obj, function (k, v) { templateVars[k] = v });
      return res.render(path, templateVars);
    }
    return next();
  }
};


exports.login = function login (req, res) {
  res.template('login.html', {
    page: 'login',
  });
};

exports.unauthorized = function unauthorized (req, res) {
  res.template('unauthorized.html', {
    page: 'unauthorized',
  });
};

exports.index = function index (req, res) {
  res.template('index.html', {
    page: 'home',
    users: req.users,
  });
};
exports.announce = function announce (req, res) {
  res.template('announce.html', {
    page: 'announce',
    subscribers: req.subscribers,
  });
};
exports.subscribers = function subscribers (req, res) {
  res.template('subscribers.html', {
    page: 'subscribers',
    subscribers: req.subscribers,
  });
};
exports.user = function user(req, res) {
  const user = req.user;
  res.template('user.html', {
    page: 'user',
    user: user,
    messages: user.messages.reverse(),
  });
};
exports.admin = function user(req, res) {
  res.template('admin.html', {
    page: 'admin',
    admins: req.admins,
  })
};
