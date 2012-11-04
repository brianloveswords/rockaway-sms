const nunjucks = require('nunjucks');
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
const util = require('util');
const dateformat = require('dateformat');

function identity(x) { return x };

env.addFilter('entities', function (string) {
  return string.replace(/</g, '&lt;').replace(/>/g, '&gt;');
});

env.addFilter('json', function (thing) {
  return JSON.stringify(thing);
})

env.addFilter('highlight', function (actual, expect) {
  if (expect === actual)
    return 'class="active"';
  return '';
});

env.addFilter('phoneFmt', function (phoneNumber) {
  const regexp = /\+?(\d)(\d{3})(\d{3})(\d{4})/;
  const match = phoneNumber.match(regexp).slice(1);
  const international = match[0];
  const area = match[1];
  const prelude = match[2];
  const postlude = match[3];
  return util.format(
    '+%s (%s) %s-%s',
    international,
    area,
    prelude,
    postlude
  );
});

env.addFilter('dateFmt', function (date) {
  const today = dateformat(Date.now(), 'mmm dS yy');
  const then = dateformat(date, 'mmm dS yy');
  var fmt = 'mmm dS, h:MM:ss TT';
  if (today === then)
    fmt = 'h:MM:ss TT';
  return dateformat(date, fmt);
});

module.exports = env;