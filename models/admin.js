const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AdminSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  level: {
    type: String,
    required: true,
    trim: true,
    default: 'schlub',
  }
});

const Admin = db.model('Admin', AdminSchema);
Admin.LEVELS = ['schlub', 'admin', 'owner'];

Admin.findOrCreate = function findOrCreate(obj, callback) {
  const query = { email: obj.email };
  const options = { upsert: true };
  var update;
  if (obj.owner)
    update = { level: 'owner' };
  Admin.findOneAndUpdate(query, update, options, callback);
};

Admin.prototype.isOwner = function isOwner() {
  return this.level === 'owner';
};


function rank(level) {
  return Admin.LEVELS.indexOf(level);
};

Admin.prototype.hasAccess = function hasAccess(level) {
  var fmt = '(user) %s = %s, (required ) %s = %s';
  var util = require('util');

  console.dir(util.format(fmt, this.level, rank(this.level), level, rank(level)));
  return rank(this.level) >= rank(level);
};

Admin.prototype.changeLevel = function changeLevel(level, callback) {
  this.level = level;
  this.save(callback);
};

module.exports = Admin;
