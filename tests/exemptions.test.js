const test = require('tap').test;
const Exemptions = require('../exemptions');

test('basic', function (t) {
  const whitelist = Exemptions(['bacon']);
  t.same(whitelist.check('ham'), false);
  t.same(whitelist.check('cheese'), false);
  t.same(whitelist.check('bacon'), true);
  t.end();
});

test('advanced', function (t) {
  const whitelist = Exemptions(['*bac*']);
  t.same(whitelist.check('ham'), false, 'no ham');
  t.same(whitelist.check('cheese'), false, 'no cheese');
  t.same(whitelist.check('bacon'), true, 'yes bacon');
  t.same(whitelist.check('bacos'), true, 'yes bacos');
  t.same(whitelist.check('chewbacca'), true, 'yes chewbacca');
  t.end();
});

test('urls', function (t) {
  var thing = '/v1/receive';
  const whitelist = Exemptions([thing]);
  t.same(whitelist.check(thing), true);
  t.end();
});
