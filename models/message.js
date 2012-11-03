const db = require('./');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  body: {
    type: String,
    required: true
  },
});

const MessageSchema = new Schema({
  date: {
    type: Date,
    default: Date.now
  },
  from: {
    type: String,
    required: true
  },
  smsId: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  responses: {
    type: [ResponseSchema]
  }
});

const Message = db.model('Message', MessageSchema);

Message.fromTxtMsg = function fromTxtMsg(txt) {
  return new Message({
    from: txt.From,
    body: txt.Body,
    smsId: txt.SmsSid
  });
};

module.exports = Message;