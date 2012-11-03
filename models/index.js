var env = require('../env');
var mongoose = require('mongoose');
var opts = env.get('mongo', {});

var connection = mongoose.createConnection(
  opts.host || 'localhost',
  opts.db || 'rockaway-sms',
  opts.port || '27017'
);

module.exports = connection;
