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

Admin.findOrCreate = function findOrCreate(obj, callback) {
  const query = { email: obj.email };
  const options = { upsert: true };
  var update;
  if (obj.owner)
    update = { level: 'owner' };
  Admin.findOneAndUpdate(query, update, options, callback);
};
module.exports = Admin;