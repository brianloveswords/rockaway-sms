var db = require('../models');
const test = require('tap').test;
const User = require('../models/user');

db.prepareTest({
  'user1': new User({
    number: '5551234',
    requiresAttention: false,
    mostRecentMessage: null
  }),
  'user2': new User({
    number: '123456789',
    requiresAttention: false,
    mostRecentMessage: null
  }),

}, function (fixtures) {
  test('User#save', function (t) {
    const user = new User({
      number: '8675309',
    });
    user.save(function (err, result) {
      console.dir(err);
      console.dir(result);
      t.end();
    });
  });

  test('User#incoming', function (t) {
    var user = fixtures['user1'];
    var message = {
      body: 'oh heyyyyy',
      type: 'question',
      date: new Date()
    };
    var savedMessage = user.incoming(message);
    t.same(user.messages.length, 1);
    t.same(user.requiresAttention, true);
    t.same(user.mostRecentIncoming, message.date);
    t.same(savedMessage.direction, 'incoming')
    t.end();
  });

  test('User#outgoing', function (t) {
    var user = fixtures['user2'];
    var message = {
      body: 'oh heyyyyy',
      date: new Date()
    };
    var savedMessage = user.outgoing(message)
    t.same(savedMessage.direction, 'outgoing', 'should be outgoing');
    t.same(savedMessage.type, 'answer', 'should be an answer');
    t.same(user.requiresAttention, false, 'should be false');
    t.same(user.mostRecentIncoming, undefined, 'should be undefined');
    t.end();
  });

  test('close', function (t) {
    db.close(), t.end();
  });
})
