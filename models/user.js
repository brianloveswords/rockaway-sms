const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const MessageSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  smsId: {
    type: String,
  },
  body: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    trim: true
  },
  direction: {
    type: String,
    trim: true,
    required: true,
    default: 'incoming'
  },
});
const UserSchema = new Schema({
  number: {
    type: String,
    required: true,
    unique: true,
  },
  messages: {
    type: [MessageSchema]
  },
  requiresAttention: {
    type: Boolean,
    default: true,
  },
  mostRecentIncoming: {
    type: Date
  }
});
const User = db.model('User', UserSchema);

User.prototype.lastMessage = function lastMessage() {
  return this.messages[this.messages.length-1]
};

User.prototype.incoming = function incoming(message) {
  this.messages.push(message);
  this.requiresAttention = true;
  this.mostRecentIncoming = message.date || new Date();
  return this.lastMessage();
};

User.prototype.outgoing = function outgoing(message) {
  message.type = 'answer';
  message.direction = 'outgoing';
  this.messages.push(message);
  return this.lastMessage();
};
module.exports = User;