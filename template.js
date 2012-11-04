var nunjucks = require('nunjucks');
var env = new nunjucks.Environment(new nunjucks.FileSystemLoader('views'));
env.addFilter('highlight', function (actual, expect) {
  if (expect === actual)
    return 'class="active"';
  return '';
});


module.exports = env;