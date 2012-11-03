const env = require('../env');
const mongoose = require('mongoose');
const opts = env.get('mongo', {});

const connection = mongoose.createConnection(
  opts.host || 'localhost',
  opts.db || 'rockaway-sms',
  opts.port || '27017'
);

module.exports = connection;
