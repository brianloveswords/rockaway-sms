var db = require('../models');
var Message = require('../models/message');
var test = require('tap').test;

db.prepareTest(function () {
  test('Message#save', function (t) {
    var msg = new Message({
      body: 'oh hai',
      from: '+18008675309',
      smsId: 'something',
      responses: [
        { body: 'halp is otw' }
      ]
    });
    msg.save(function (err, result) {
      t.notOk(err, 'no error');
      t.ok(result, 'saved ok');
      msg.responses.push({ body: 'moar help' });
      msg.save(function (err, result) {
        t.notOk(err, 'no error');
        t.ok(result, 'saved ok');
        t.same(result.responses.length, 2);
        t.end();
      });
    });
  });

  test('Message.fromTxtMsg', function (t) {
    var txt ={
      AccountSid: 'loloololo',
      Body: 'more like test msg',
      ToZip: '11355',
      FromState: 'CT',
      ToCity: 'FLUSHING',
      SmsSid: 'SM5396f7ceb541ca96a710cc8a823db586',
      ToState: 'NY',
      To: '+17184121325',
      ToCountry: 'US',
      FromCountry: 'US',
      SmsMessageSid: 'SM5396f7ceb541ca96a710cc8a823db586',
      ApiVersion: '2010-04-01',
      FromCity: 'NORWICH',
      SmsStatus: 'received',
      From: '+18607055712',
      FromZip: '06351'
    };

    var msg = Message.fromTxtMsg(txt);
    t.same(msg.body, 'more like test msg');
    t.same(msg.from, '+18607055712');
    t.same(msg.smsId, 'SM5396f7ceb541ca96a710cc8a823db586');
    t.end();
  });

  test('finish', function (t) {
    db.close(), t.end();
  });

})
