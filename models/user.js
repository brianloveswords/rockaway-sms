const db = require('./');
const mongoose = require('mongoose');
const Twilio = require('../twilio');
const rerouter = require('../rerouter');
const async = require('async');
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
  lastConfirmation: {
    type: Date,
  },
  receiveAnnouncements: {
    type: Boolean,
    default: false,
  }
});
const User = db.model('User', UserSchema);

User.Messages = {
  MESSAGE_CONFIRMATION: 'Message received! Note, you will only receive this message at most once per day.',
  UNSUBSCRIBE: 'You will no longer receive any alert messages. To resubscibe, reply "subscribe".',
  SUBSCRIBE: 'You have been added to the alert list. You can stop receiving notifications at any time by texting "stop"',
  ALREADY_SUBSCRIBED: 'You are already on the list. If you wish to stop getting messages, reply with "stop"',
};

function defaultMsg(rawMsgObj) {
  const rightNow = Date.now();
  return {
    mostRecentIncoming: rightNow,
    requiresAttention: true,
    '$push' : {
      messages: {
        date: rightNow,
        body: rawMsgObj.Body,
        smsId: rawMsgObj.SmsId,
        direction: 'incoming',
        type: 'question'
      }
    }
  };
}

function subscribeMsg(rawMsgObj) {
  var update = defaultMsg(rawMsgObj);
  var newMsg = update['$push'].messages;
  delete update.requiresAttention;
  update.receiveAnnouncements = true;
  newMsg.type = 'subscribe';
  return update;
}

function unsubscribeMsg(rawMsgObj) {
  var update = defaultMsg(rawMsgObj);
  var newMsg = update['$push'].messages;
  delete update.requiresAttention;
  update.receiveAnnouncements = false;
  newMsg.type = 'unsubscribe';
  return update;
}

const MessageRouter = rerouter([
  [/^stop/i, { fn: unsubscribeMsg, type: 'unsubscribe' }],
  [/^sub(scribe)?/i, {fn: subscribeMsg, type: 'subscribe' }]
], {fn: defaultMsg, type: 'question' });


/**
 * Capture an incoming message and create or update a user.
 *
 * @param {Object} rawMsgObj Raw text message coming from Twilio
 * @param {Function} callback
 * @see `MessageRouter`
 */

User.captureIncoming = function captureIncoming(rawMsgObj, callback) {
  const sender = rawMsgObj.From;
  const message = rawMsgObj.Body;
  const route = MessageRouter(message);
  const update = route.fn(rawMsgObj);
  User.findOneAndUpdate({
    number: rawMsgObj.From
  }, update, {
    upsert: true
  }, callback);
};

/**
 * See if the user needs to have another confirmation sent
 *
 * @return {Boolean}
 */

User.prototype.needsConfirmation = function needsConfirmation() {
  var oneDay = 24 * 60 * 60 * 1000;
  return (this.lastConfirmation || 0) <= (Date.now() - oneDay);
};

/**
 * Update `lastConfirmation` if:
 *   - There has been at least message received
 *   - The last message is a `question` type
 *   - The last confirmation was at least a day ago
 *
 * @param {Function} callback
 * @see `User#needsConfirmation`
 * @see `User#lastMessage`
 */

User.prototype.updateConfirmation = function updateConfirmation(callback) {
  callback = callback || function(){};
  const lastMsg = this.lastMessage();
  if (lastMsg && lastMsg.type == 'question' && this.needsConfirmation()) {
    this.lastConfirmation = Date.now();
    return this.save(callback);
  }
  return callback();
};

/**
 * Make a TwiML response for the given incoming message. Returns just
 * the XML prolog if there's no response to make.
 *
 * @param {Object} rawMsgObj Incoming message, raw.
 * @return {String} TwiML to respond with
 */

User.prototype.makeTwiMLResponse = function makeTwiMLResponse(rawMsgObj) {
  const message = rawMsgObj.Body;
  const route = MessageRouter(message);
  const msgs = {
    question: (this.needsConfirmation()
      ? User.Messages.MESSAGE_CONFIRMATION
      : null),
    unsubscribe: User.Messages.UNSUBSCRIBE,
    subscribe: (this.receiveAnnouncements
      ? User.Messages.ALREADY_SUBSCRIBED
      : User.Messages.SUBSCRIBE),
  }
  const msg = msgs[route.type];
  return Twilio.SMS.reply({ to: this.number, msg: msg });
};

/**
 * Get the last message for the user
 *
 * @return {Message} message
 */

User.prototype.lastMessage = function lastMessage() {
  return this.messages[this.messages.length-1]
};

/**
 * Send a reply to a user. On a succesful save, hits Twilio
 * to actually send the message.
 *
 * @param {Message} msgObj
 * @param {Function} callback
 */

User.prototype.sendReply = function outgoing(msgObj, callback) {
  callback = callback || function(){};

  msgObj.type = 'answer';
  msgObj.direction = 'outgoing';
  this.addMessage(msgObj, function (err) {
    if (err)
      return callback(err);
    Twilio.SMS.create({
      to: this.number,
      body: msgObj.body
    });
    return callback();
  }.bind(this));
  return this.lastMessage();
};

/**
 * Simple method for adding a message & saving
 *
 * @param {Message} msgObj
 * @param {Function} callback
 */

User.prototype.addMessage = function addMessage(msgObj, callback) {
  this.messages.push(msgObj);
  this.save(callback);
};


/**
 * Send a broadcast out to all users who subscribe to the announcelist
 *
 * @param {String} message
 * @param {Function} callback
 */

User.broadcast = function broadcast(message, callback) {
  callback || function(){};

  var numbers;
  const query = { receiveAnnouncements: true };
  const msgObj = {
    body: message,
    type: 'announcement',
    direction: 'outgoing'
  };

  function addMessage(i, callback) {
    return i.addMessage(msgObj, callback);
  }

  User.find(query, function (err, users) {
    if (err)
      return callback(err);
    numbers = users.map(function (inst) { return inst.number });
    Twilio.SMS.announce(numbers, message);
    async.map(users, addMessage, callback);
  });
};



module.exports = User;