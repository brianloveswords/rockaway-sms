const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
  noun: { type: String, required: true },
  verb: { type: String, required: true },
  stuff: { type: String, },
});

const Activity = db.model('Activity', ActivitySchema);
module.exports = Activity;