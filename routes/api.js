var Twilio = require('../twilio');

exports.capture = function (req, res) {
  console.dir(req);
  console.dir(req.body);
  res.send('ok');
};

exports.verify = function (req, res, next) {
  if (req.body['AccountSid'] !== Twilio.AccountSid)
    return res.send(403, 'Invalid account');
  return next();
};