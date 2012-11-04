const db = require('./');
const mongoose = require('mongoose');
const Twilio = require('../twilio');
const rerouter = require('../rerouter');
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
    type: Date,
  },
  receiveAnnouncements: {
    type: Boolean,
    default: false,
  }
});
const User = db.model('User', UserSchema);

User.Messages = {
  UNSUBSCRIBE: 'You will no longer receive any alert messages. To resubscibe, reply "subscribe".',
  SUBSCRIBE: 'You have been added to the alert list. You can stop receiving notifications at any time by texting "stop"',
  ALREADY_SUBSCRIBED: 'You are already on the list. If you wish to stop getting messages, reply with "stop"',
};

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
;

const MessageRouter = rerouter([
  [/^stop/i, { fn: unsubscribeMsg, type: 'unsubscribe' }],
  [/^sub(scribe)?/i, {fn: subscribeMsg, type: 'subscribe' }]
], {fn: defaultMsg, type: 'question' });

User.captureIncoming = function captureIncoming(message, callback) {
  var route = MessageRouter(message.Body);
  var update = route.fn(message);
  User.findOneAndUpdate({
    number: message.From
  }, update, {
    upsert: true
  }, callback);
};

User.prototype.makeTwiMLResponse = function makeTwiMLResponse(message) {
  const route = MessageRouter(message.Body);
  const msgs = {
    unsubscribe: User.Messages.UNSUBSCRIBE,
    subscribe: this.receiveAnnouncements
      ? User.Messages.ALREADY_SUBSCRIBED
      : User.Messages.SUBSCRIBE,
  }
  const msg = msgs[route.type];
  return Twilio.SMS.reply({ to: message.From, msg: msg });
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