const Twilio = require('../twilio');
const User = require('../models/user');
const rerouter = require('../rerouter');
const logger = require('../logger');

// HTTP endpoints
// --------------
exports.capture = function (req, res, next) {
  const textMessage = req.body;
  User.captureIncoming(textMessage, function (err, user) {
    if (err)
      return next(err);
    req.message = textMessage;
    req.user = user;
    return next();
  });
};

exports.respond = function respond (req, res, next) {
  const user = req.user;
  const message = req.message;
  const response = user.makeTwiMLResponse(message);
  user.updateConfirmation(function () {
    res.type('xml');
    res.send(response);
  });
};


// exports.listMessages = function listMessages (req, res) {
//   const response = { status: 'ok' };
//   Message.find(function (err, messages) {
//     if (err) // #TODO: log this
//       return (err.code = 500, res.send(500, err));
//     response.messages = messages.map(function (msg) {
//       return {
//         from: msg.from,
//         body: msg.body,
//         smsId: msg.smsId,
//         date: msg.date,
//         responses: msg.responses,
//       };
//     });
//     return res.send(response);
//   });
// };

exports.listSubscribers = function listSubscribers (req, res) {
  const response = { status: 'ok' };
  response.subscribers = req.subscribers.map(function (sub) {
    return { number: sub.number };
  });
  return res.send(response);
};


// Middleware
// ----------

exports.verify = function (req, res, next) {
  // if (req.body['AccountSid'] !== Twilio.AccountSid)
  //   return res.send(403, 'Invalid account');
  return next();
};

