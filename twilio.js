var Twilio = require('twilio-js');
var env = require('./env');
var conf = env.get('twilio');
var util = require('util');

Twilio.AccountSid = conf.sid;
Twilio.AuthToken = conf.token;
Twilio.FromNumber = conf.from;

function responseXml(str) {
  return util.format('<Response>%s</Response>', str);
}

function smsXml(from, to, msg) {
  return util.format('<Sms from="%s" to="%s">%s</Sms>', from, to, msg);
}
Twilio.SMS.reply = function reply(opts) {
  var response = Twilio.TwiML.build();
  response += responseXml(smsXml(Twilio.FromNumber, opts.to, opts.msg)) ;
  return response;
};

module.exports = Twilio;