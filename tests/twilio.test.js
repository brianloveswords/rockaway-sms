var test = require('tap').test;
var Twilio = require('../twilio');

test('Twilio.SMS.reply', function (t) {
  var result = Twilio.SMS.reply({ to: 'some guy', msg: 'this is the message'});
  var expect = '<?xml version="1.0" encoding="UTF-8"?>\n<Response><Sms from="+17184121325" to="some guy">this is the message</Sms></Response>';
  t.same(result, expect);
  t.end();
});
