var Twilio = require('../twilio');
var Message = require('../models/message');
var Subscription = require('../models/subscription');
var rerouter = require('../rerouter');
var logger = require('../logger');

// SMS endpoints
// -------------
const messageRouter = rerouter([
  [/^sub(scribe)?/i, subscribeMsg],
  [/^stop/i, unsubscribeMsg]
], routeNotFound);

function subscribeMsg(msg, callback) {
  const sender = msg.from;
  const confirmation = 'You have been added to the alert list. You can stop receiving notifications at any time by texting "stop"';
  const alreadyOn = 'You are already on the list. If you wish to stop getting messages, reply with "stop"';
  logger.info('attemping to subscribe the number ' + sender);
  Subscription.add(sender, function (err, added) {
    if (err) {
      logger.error('there was a problem subscribing' + sender, err);
      return callback(err);
    }
    if (added) {
      logger.info('successfully subscribed ' + sender);
      return callback(null, confirmation);
    }
    logger.info('already subscribed ' + sender);
    return callback(null, alreadyOn);
  });
}

function unsubscribeMsg(msg, callback) {
  const sender = msg.from;
  const confirmation = 'You will no longer recieve any alert messages. To resubscibe, reply "subscribe".';
  logger.info('attemping to unsubscribe the number ' + sender);
  Subscription.remove(sender, function (err, added) {
    if (err) {
      logger.error('there was a problem unsubscribing' + sender, err);
      return callback(err);
    }
    return callback(null, confirmation);
  });
}

function routeNotFound(msg, cb) {
  return cb(null, 'Message received')
};

// HTTP endpoints
// --------------
exports.capture = function (req, res) {
  const msg = Message.fromTxtMsg(req.body);
  const sender = msg.from;
  var action, resp;
  msg.save(function (err, result) {
    if (err) {
      logger.error('error saving the message', err);
      return (err.code = 500, res.send(500, err));
    }
    action = messageRouter.find(msg.body);
    action(msg, function (err, response) {
      if (err) {
        logger.error('error running the action', err);
        return (err.code = 500, res.send(500, err));
      }
      resp = Twilio.SMS.reply({ to: sender, msg: response });
      logger.info('replying with: ' + resp);
      res.type('xml');
      return res.send(resp);
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

