var test = require('tap').test;
var Admin = require('../models/admin');
var db = require('../models');

db.prepareTest(function () {
  test('Basic saving', function (t) {
    var admin = new Admin({
      email: 'brian@example.com'
    });
    admin.save(function (err, result) {
      t.notOk(err, 'no error');
      t.ok(result, 'some result');
      t.same(result.level, 'schlub', 'should be a schlub');
      t.end();
    });
  });

  test('Admin.findOrCreate', function (t) {
    var person = { email: 'brian@example.org', owner: false };
    Admin.findOrCreate(person, function (err, admin) {
      t.same(admin.email, person.email);
      t.same(admin.level, 'schlub');
      t.end();
    });
  });

  test('Admin#isOwner', function (t) {
    var admin = new Admin({ email: 'yup'});
    t.same(admin.isOwner(), false, 'should not be owner');
    admin.level = 'owner';
    t.same(admin.isOwner(), true, 'should be owner');
    t.end();
  });

  test('Admin#hasAccess', function (t) {
    var admin = new Admin({ email: 'y', level: 'owner' });
    t.same(admin.hasAccess('schlub'), true);
    t.same(admin.hasAccess('admin'), true);
    t.same(admin.hasAccess('owner'), true);

    admin.level = 'admin';
    t.same(admin.hasAccess('schlub'), true);
    t.same(admin.hasAccess('admin'), true);
    t.same(admin.hasAccess('owner'), false);

    admin.level = 'schlub';
    t.same(admin.hasAccess('wibble wobble'), true);
    t.same(admin.hasAccess('schlub'), true);
    t.same(admin.hasAccess('admin'), false);
    t.same(admin.hasAccess('owner'), false);

    admin.level = 'notthing at all';
    t.same(admin.hasAccess('schlub'), false);
    t.same(admin.hasAccess('admin'), false);
    t.same(admin.hasAccess('owner'), false);
    t.end();
  });


  test('done', function (t) {
    db.close(), t.end();
  });

});
