var Twilio = require('twilio-js');
var env = require('./env');
var conf = env.get('twilio');

Twilio.AccountSid = conf.sid;
Twilio.AuthToken = conf.token;

module.exports = Twilio;