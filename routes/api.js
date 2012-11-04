const Twilio = require('../twilio');
const User = require('../models/user');
const rerouter = require('../rerouter');
const logger = require('../logger');

// HTTP endpoints
// --------------
exports.capture = function capture(req, res, next) {
  const textMessage = req.body;
  User.captureIncoming(textMessage, function (err, user) {
    if (err)
      return next(err);
    req.message = textMessage;
    req.user = user;
    return next();
  });
};

exports.respond = function respond(req, res, next) {
  const user = req.user;
  const message = req.message;
  const response = user.makeTwiMLResponse(message);
  user.updateConfirmation(function () {
    res.type('xml');
    res.send(response);
  });
};

exports.listSubscribers = function listSubscribers(req, res) {
  const response = { status: 'ok' };
  response.subscribers = req.subscribers.map(function (sub) {
    return { number: sub.number };
  });
  return res.send(response);
};

exports.listUsers = function listUsers(req, res) {
  const response = { status: 'ok' };
  response.users = req.users;
  res.send(response);
};

exports.listNeedy = function listNeedy(req, res) {
  const response = { status: 'ok' };
  response.users = req.users.map(function (user) {
    return {
      _id: user.id,
      number: user.number,
      lastMessage: user.lastIncomingMessage()
    }
  });
  res.send(response);
};

exports.userInfo = function userInfo(req, res) {
  const response = { status: 'ok' };
  response.user = req.user;
  res.send(response);
};

exports.replyToUser = function replyToUser(req, res) {
  const message = req.body.message;
  const user = req.user;
  var msgObj;
  if (!message)
    return res.send(400, { error: 'needs a message' });
  user.sendReply({ body: message }, function (err) {
    if (err)
      return res.send(500, err);
    msgObj = user.lastMessage();
    return res.send({ status: 'ok', message: msgObj });
  });
};

exports.broadcastMessage = function broadcastMessage(req, res) {
  const message = req.body.message;
  if (!message)
    return res.send(400, { error: 'needs a message' });
  User.broadcast(message, function (err, users) {
    if (err)
      return res.send(500, err);
    return res.send({ status: 'ok', sent: users.length });
  });
};

// Middleware
// ----------
exports.verify = function (req, res, next) {
  // if (req.body['AccountSid'] !== Twilio.AccountSid)
  //   return res.send(403, 'Invalid account');
  return next();
};

