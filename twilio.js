const Twilio = require('twilio-js');
const env = require('./env');
const conf = env.get('twilio');
const util = require('util');

Twilio.AccountSid = conf.sid;
Twilio.AuthToken = conf.token;
Twilio.FromNumber = conf.from;

function responseXml(str) {
  return util.format('<Response>%s</Response>', str);
}

function smsXml(from, to, msg) {
  return util.format('<Sms from="%s" to="%s">%s</Sms>', from, to, msg);
}

var originalCreate = Twilio.SMS.create.bind(Twilio.SMS);

Twilio.SMS.create = function smsCreate(opts) {
  opts.from = Twilio.FromNumber;
  opts.body = opts.body || opts.msg;
  return originalCreate(opts);
};

Twilio.SMS.reply = function smsReply(opts) {
  var response = Twilio.TwiML.build();
  response += responseXml(smsXml(Twilio.FromNumber, opts.to, opts.msg)) ;
  return response;
};

Twilio.SMS.announce = function (numbers, msg) {
  numbers.forEach(function (number) {
    Twilio.SMS.create({ to: number, msg: msg });
  });
};

module.exports = Twilio;