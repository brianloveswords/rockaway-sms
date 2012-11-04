const nunjucks = require('nunjucks');
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
const util = require('util');
const dateformat = require('dateformat');

function identity(x) { return x };

env.addFilter('highlight', function (actual, expect) {
  if (expect === actual)
    return 'class="active"';
  return '';
});

env.addFilter('phoneFmt', function (phoneNumber) {
  const regexp = /\+(\d)(\d{3})(\d{3})(\d{4})/;
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

const DAYS = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday',
  'Thursday', 'Friday', 'Saturday'
];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
env.addFilter('dateFmt', function (date) {
  return dateformat(date, 'dddd mmm dS, h:MM:ss TT');
});

module.exports = env;