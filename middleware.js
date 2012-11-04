var env = require('./env');
var express = require('express');
var RedisStore = require('connect-redis')(express);
var crypto = require('crypto');
var logger = require('./logger');
var util = require('util');

exports.cookieParser = function () {
  var secret = env.get('secret');
  return express.cookieParser(secret);
};

exports.session = function () {
  var options = env.get('redis', {
    host: 'localhost',
    port: 6379,
  });
  return express.session({
    key: 'rockaway-sms.sid',
    store: new RedisStore(options),
    secret: env.get('secret'),
  });
};

exports.flash = function () {
  function store(type, msg) {
    if (arguments.length === 1)
      msg = type, type = 'info';
    msg = { type: type, body: msg };
    return this.session._flash = msg;
  }
  function retrieve() {
    const msg = this.session._flash;
    delete this.session._flash;
    return msg;
  }
  function dispatch() {
    const args = [].slice.call(arguments);
    if (!args.length)
      return retrieve.call(this);
    return store.apply(this, args);
  }
  return function (req, res, next) {
    req.flash = dispatch;
    return next();
  };
}

/** Adapted from connect/lib/middleware/csrf.js */
exports.csrf = function csrf(options) {
  options = options || {}
  var whitelist = parseWhitelist(options.whitelist);

  function getToken(req) {
    return (req.body && req.body._csrf)
      || (req.query && req.query._csrf)
      || (req.headers['x-csrf-token']);
  }

  return function(req, res, next){
    var token, val, err;
    if (isExempt(whitelist, req.url))
      return next();

    // generate CSRF token
    token = req.session._csrf || (req.session._csrf = uid(24));

    // ignore these methods
    if ('GET' === req.method ||
        'HEAD' === req.method ||
        'OPTIONS' === req.method)
      return next();

    // determine value
    val = getToken(req);

    // check
    if (val !== token) {
      logger.warn(util.format('CSRF failure at %s', req.url));
      return res.send(403);
    }

    return next();
  }
};

exports.requireLogin = function requireLogin(options) {
  options = options || {}
  const redirect = options.redirect || '/login';
  const field = options.field || 'user';
  const whitelist = parseWhitelist(options.whitelist);
  return function (req, res, next) {
    const redirectPath = util.format('%s?path=%s', redirect, req.url);
    const loginRe = RegExp('^' + redirect + '(\\?.*)?$');
    if (req.url.match(loginRe))
      return next();
    if (isExempt(whitelist, req.url))
      return next();
    if (!req[field])
      return res.redirect(303, redirectPath);
    return next();
  }
};


function uid(len) {
  return crypto.randomBytes(Math.ceil(len * 3 / 4))
    .toString('base64')
    .slice(0, len);
};

function isExempt(whitelist, path) {
  var i = whitelist.length;
  while (i--) {
    if (whitelist[i].test(path))
      return true;
  }
  return false;
}

function parseWhitelist(array) {
  if (!array)
    return [];
  return array.map(function (entry) {
    if (typeof entry === 'string') {
      entry = entry.replace('*', '.*?');
      return RegExp('^' + entry + '$');
    }
    return entry;
  });
}
