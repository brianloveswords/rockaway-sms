var test = require('tap').test;
var rerouter = require('../rerouter');

function twoThings() {
  return this.matches;
}
function truth() {
  return true;
}

const paths = [
  [/^hey (.+?) (.+?)$/, twoThings],
  [/^hello world$/, truth],
];

test('finding', function (t) {
  var fn = rerouter(paths).find('hey party people');
  t.same(fn(), ['party', 'people']);
  t.end();
});

test('routing', function (t) {
  t.same(rerouter(paths).route('hey party people'), ['party', 'people']);
  t.notOk(rerouter(paths).route('loollll'), 'should not find anything');
  t.same(rerouter(paths).route('hello world'), true);
  t.end();
});

test('fallthrough', function (t) {
  var router = rerouter(paths, function () { return 'fallthrough' });
  t.same(router.route('nope nothing'), 'fallthrough');
  t.end();
});
