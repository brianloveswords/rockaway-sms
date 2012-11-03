var Twilio = require('../twilio');
var Message = require('../models/message');

function firstWord(string) { return string.trim().split(' ', 1) }
function routeMessage(msg) {
  const body = msg.body || '';
  const action = firstWord(body).toLowerCase();
   console.dir(action);
};

exports.capture = function (req, res) {
  const txt = req.body;
  const msg = Message.fromTxtMsg(txt);
  var response = Twilio.TwiML.build();

  routeMessage(msg);

  console.log('got a message:', txt);
  msg.save(function (err, result) {
    if (err) // #TODO: log this
      return (err.code = 500, res.send(500, err));
    return res.send(response);
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


// Middleware
// ----------

exports.verify = function (req, res, next) {
  if (req.body['AccountSid'] !== Twilio.AccountSid)
    return res.send(403, 'Invalid account');
  return next();
};

