var app = require('./app');
if (!module.parent) {
  app.listen(3000);
}