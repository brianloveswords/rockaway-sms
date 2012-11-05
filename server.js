const habitat = require('habitat');
const app = require('./app');
if (!module.parent) {
  app.listen(habitat.get('port', 3000));
}