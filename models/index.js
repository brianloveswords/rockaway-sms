const env = require('../env');
const mongoose = require('mongoose');
const opts = env.get('mongo', {});
const async = require('async');

const connection = mongoose.createConnection(
  opts.host || 'localhost',
  opts.db || 'rockaway-sms',
  opts.port || '27017'
);

module.exports = connection;

function removeInstance(instance, callback) { instance.remove(callback) }
function saveInstance(instance, callback) { instance.save(callback) }

function values(object) {
  return Object.keys(object).map(function (k) { return object[k] });
}

function flush(Model, callback) {
  const name = Model.collection.name;
  Model.find(function (err, instances) {
    console.log('removing all from %s', name);
    async.map(instances, removeInstance, callback);
  });
}

connection.prepareTest = function prepareTest(fixtures, callback) {
  if (typeof fixtures === 'function')
    callback = fixtures, fixtures = callback;
  callback = callback || function(){};
  const pathutil = require('path');
  const fs = require('fs');
  const models = fs.readdirSync(__dirname).filter(function (f) {
    return f !== 'index.js';
  }).map(function (f) { return require('./' + f) });
  const instances = values(fixtures);

  async.map(models, flush, function (err) {
    if (err) throw err;

    async.map(instances, saveInstance, function (err) {
      if (err) throw err;
      return callback(fixtures);
    })
  });
};