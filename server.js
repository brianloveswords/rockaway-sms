const env = require('./env');
const app = require('./app');
if (!module.parent) {
  app.listen(env.get('port', 3000));
}