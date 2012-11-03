var Twilio = require('../twilio');
var Message = require('../models/message');
var Subscription = require('../models/subscription');
var rerouter = require('../rerouter');

const messageRouter = rerouter([
  [/^sub(scribe)?/i, subscribeMsg]
]);

function subscribeMsg(msg, callback) {
  var number = msg.from;
  Subscription.add(number, function (err, added) {
    if (err) return callback(err);
    if (added) {
      return callback(null, 'added number ' + number);
    }
    return callback(null, 'did not add number ' + number);
  });
}

function routeNotFound(msg, cb) {
  console.log('route not found with', msg);
  return cb()
};

exports.capture = function (req, res) {
  const txt = req.body;
  const msg = Message.fromTxtMsg(txt);
  var response = Twilio.TwiML.build();
  var action;
  msg.save(function (err, result) {
    if (err) // #TODO: log this
      return (err.code = 500, res.send(500, err));

    action = messageRouter.find(msg.body) || routeNotFound;
    action(msg, function (err, response) {
      console.dir(err);
      console.log(response);
      return res.send(response);
    });
  });
};

exports.listMessages = function listMessages (req, res) {
  const response = { status: 'ok' };
  Message.find(function (err, messages) {
    if (err) // #TODO: log this
      return (err.code = 500, res.send(500, err));
    response.messages = messages.map(function (msg) {
      return {
        from: msg.from,
        body: msg.body,
        smsId: msg.smsId,
        date: msg.date,
        responses: msg.responses,
      };
    });
    return res.send(response);
  });
};

exports.listSubscribers = function listSubscribers (req, res) {
  const response = { status: 'ok' };
  Subscription.find(function (err, subscribers) {
    if (err) // #TODO: log this
      return (err.code = 500, res.send(500, err));
    response.subscribers = subscribers.map(function (sub) {
      return { number: sub.number };
    });
    return res.send(response);
  });
};


// Middleware
// ----------

exports.verify = function (req, res, next) {
  if (req.body['AccountSid'] !== Twilio.AccountSid)
    return res.send(403, 'Invalid account');
  return next();
};

