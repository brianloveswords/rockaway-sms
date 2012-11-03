var test = require('tap').test;
var rerouter = require('../rerouter');

function twoThings(one, two) {
  return [one, two]
}
function truth() {
  return true;
}

const paths = [
  [/^hey (.+?) (.+?)$/, twoThings],
  [/^hello world$/, truth],
];

test('finding, simple', function (t) {
  var result = rerouter(paths).find('hello world');
  t.same(result.fn, truth);
  t.end();
});

test('complex, simple', function (t) {
  var result = rerouter(paths).find('hey sup yo');
  t.same(result.fn, twoThings);
  t.same(result.match, ['sup', 'yo']);
  t.end();
});

test('routing', function (t) {
  var paths = [
    [/^hey (.+?) (.+?)$/, function (one, two) { return [one, two] }],
    [/^hello world$/, function () { return true }],
  ];

  t.notOk(rerouter(paths).route('loollll'), 'should not find anything');
  t.same(rerouter(paths).route('hello world'), true);
  t.same(rerouter(paths).route('hey party people'), ['party', 'people']);
  t.end();
});
