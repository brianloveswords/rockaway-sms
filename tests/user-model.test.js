const db = require('../models');
const test = require('tap').test;
const User = require('../models/user');
const Twilio = require('../twilio');


// let's hijack some twilio methods!
const EventEmitter = require('events').EventEmitter;
function emit(name) {
  return function () {
    var args = [].slice.call(arguments);
    args.unshift(name);
    this.emit.apply(this, args);
    this.removeAllListeners(name);
  }
}
Twilio.SMS.__proto__ = EventEmitter.prototype;
Twilio.SMS.create = emit('create');
Twilio.SMS.reply = emit('reply');
Twilio.SMS.announce = emit('announce');

db.prepareTest({
  'user1': new User({
    number: '1',
    requiresAttention: false,
  }),
  'user2': new User({
    number: '2',
    requiresAttention: false,
  }),
  'user3': new User({
    number: '3',
    requiresAttention: false,
    messages: [{
      body: 'hi',
      type: 'question',
      direction: 'incoming',
    }]
  }),
  'user4': new User({
    number: '4',
    requiresAttention: false,
  })
}, function (fixtures) {
  test('User#save', function (t) {
    const user = new User({
      number: '8675309',
    });
    user.save(function (err, result) {
      t.notOk(err, 'should not have errors');
      t.ok(result, 'should save');
      t.end();
    });
  });

  test('User#sendReply', function (t) {
    var user = fixtures['user2'];
    var message = {
      body: 'oh heyyyyy',
      date: new Date()
    };
    var savedMessage = user.sendReply(message)
    t.same(savedMessage.direction, 'outgoing', 'should be outgoing');
    t.same(savedMessage.type, 'answer', 'should be an answer');
    t.same(user.requiresAttention, false, 'should be false');
    t.same(user.mostRecentIncoming, undefined, 'should be undefined');
    t.end();
  });

  test('User#captureIncoming: new user', function (t) {
    var testMessage = {
      From: '987654321',
      Body: 'I am a new user',
      SmsId: 'some id'
    }
    User.captureIncoming(testMessage, function (err, user) {
      t.notOk(err, 'should not get an error');
      var message = user.lastMessage();
      t.same(user.number, testMessage.From);
      t.same(message.direction, 'incoming');
      t.same(message.type, 'question');
      t.end();
    });
  });

  test('User#captureIncoming: old user', function (t) {
    var user = fixtures['user3'];
    var testMessage = {
      From: user.number,
      Body: 'I am an old user',
      SmsId: 'some id'
    }
    t.same(user.requiresAttention, false);
    User.captureIncoming(testMessage, function (err, user) {
      t.notOk(err, 'should not get an error');
      var message = user.lastMessage();
      t.same(user.messages.length, 2);
      t.same(user.requiresAttention, true);
      t.same(message.direction, 'incoming');
      t.same(message.type, 'question');
      t.end();
    });
  });

  test('User#captureIncoming: old user, subscribe', function (t) {
    var user = fixtures['user4'];
    var testMessage = {
      From: user.number,
      Body: 'subscribe',
      SmsId: 'some id'
    }
    t.same(user.requiresAttention, false);
    User.captureIncoming(testMessage, function (err, user) {
      t.notOk(err, 'should not get an error');
      var message = user.lastMessage();
      t.same(user.messages.length, 1);
      t.same(user.requiresAttention, false);
      t.same(user.receiveAnnouncements, true);
      t.same(message.type, 'subscribe');
      t.end();
    });
  });

  test('User#captureIncoming: same old user, unsubscribe', function (t) {
    var user = fixtures['user4'];
    var testMessage = {
      From: user.number,
      Body: 'stop',
      SmsId: 'some id'
    }
    User.captureIncoming(testMessage, function (err, user) {
      t.notOk(err, 'should not get an error');
      var message = user.lastMessage();
      t.same(user.messages.length, 2);
      t.same(user.requiresAttention, false);
      t.same(user.receiveAnnouncements, false);
      t.same(message.type, 'unsubscribe');
      t.end();
    });
  });

  test('User#makeTwiMLResponse: stop message', function (t) {
    var user = fixtures['user4'];
    var testMessage = { From: user.number, Body: 'stop', SmsId: 'some id'};
    Twilio.SMS.once('reply', function (opts) {
      t.same(opts.to, user.number);
      t.same(opts.msg, User.Messages.UNSUBSCRIBE);
      t.end();
    });
    user.makeTwiMLResponse(testMessage);
  });

  test('User#makeTwiMLResponse: start message, fresh', function (t) {
    var user = fixtures['user4'];
    var testMessage = {From: user.number, Body: 'subscribe', SmsId: 'some id' };
    user.receiveAnnouncements = false;
    Twilio.SMS.once('reply', function (opts) {
      t.same(opts.to, user.number);
      t.same(opts.msg, User.Messages.SUBSCRIBE);
      t.end();
    });
    user.makeTwiMLResponse(testMessage);
  });

  test('User#makeTwiMLResponse: start message, already subscribed', function (t) {
    var user = fixtures['user4'];
    var testMessage = {From: user.number, Body: 'subscribe', SmsId: 'some id' };
    user.receiveAnnouncements = true;
    Twilio.SMS.once('reply', function (opts) {
      t.same(opts.to, user.number);
      t.same(opts.msg, User.Messages.ALREADY_SUBSCRIBED);
      t.end();
    });
    user.makeTwiMLResponse(testMessage);
  });

  test('close', function (t) {
    db.close(), t.end();
  });
})
