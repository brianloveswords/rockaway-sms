var db = require('../models');
var test = require('tap').test;
var Subscription = require('../models/subscription');

db.prepareTest({
  'test' : new Subscription({ number: '8675309' }),
  'remove-me': new Subscription({ number: 'to-remove' })
}, function (fixtures) {
  test('Subscription save', function (t) {
    var sub = new Subscription({number: 'some number'});
    sub.save(function (err) {
      t.notOk(err, 'should not have an error');
      t.end();
    });
  });

  test('Subscription save duplicate', function (t) {
    var num = fixtures['test'].number;
    var sub = new Subscription({number: num});
    sub.save(function (err) {
      t.same(err.code, 11000);
      t.end();
    })
  });

  test('Subscription.add', function (t) {
    t.plan(2);
    var existingNumber = fixtures['test'].number;
    Subscription.add(existingNumber, function (err, added) {
      t.same(added, false, 'should not add duplicate');
    });
    Subscription.add('this is a new number', function (err, added) {
      t.same(added, true, 'should add new number');
    });
  });

  test('Subscription.remove', function (t) {
    t.plan(2);
    var num = fixtures['remove-me'].number;
    Subscription.remove(num, function (err, removed) {
      t.same(removed, true, 'should have removed');
    });
    Subscription.remove('should not exist', function (err, removed) {
      t.same(removed, false, 'do not remove non-existent number');
    });
  });


  test('done', function (t) {
    db.close(), t.end();
  });
});