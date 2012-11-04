const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rerouter = require('../rerouter');

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
    type: Date,
  },
  receiveAnnouncements: {
    type: Boolean,
    default: false,
  }
});
const User = db.model('User', UserSchema);


function defaultMsg(message) {
  const rightNow = Date.now();
  return {
    mostRecentIncoming: rightNow,
    requiresAttention: true,
    '$push' : {
      messages: {
        date: rightNow,
        body: message.Body,
        smsId: message.SmsId,
        direction: 'incoming',
        type: 'question'
      }
    }
  };
}

function subscribeMsg(message) {
  var update = defaultMsg(message);
  var newMsg = update['$push'].messages;
  delete update.requiresAttention;
  update.receiveAnnouncements = true;
  newMsg.type = 'subscribe';
  return update;
}

function unsubscribeMsg(message) {
  var update = defaultMsg(message);
  var newMsg = update['$push'].messages;
  delete update.requiresAttention;
  update.receiveAnnouncements = false;
  newMsg.type = 'unsubscribe';
  return update;
}

const MessageRouter = rerouter([
  [/^stop/i, unsubscribeMsg],
  [/^sub(scribe)?/i, subscribeMsg]
], defaultMsg);

User.captureIncoming = function captureIncoming(message, callback) {
  var route = MessageRouter(message.Body);
  var update = route(message);
  User.findOneAndUpdate({
    number: message.From
  }, update, {
    upsert: true
  }, callback);
};

User.prototype.lastMessage = function lastMessage() {
  return this.messages[this.messages.length-1]
};

User.prototype.sendReply = function outgoing(message) {
  message.type = 'answer';
  message.direction = 'outgoing';
  this.messages.push(message);
  return this.lastMessage();
};


module.exports = User;