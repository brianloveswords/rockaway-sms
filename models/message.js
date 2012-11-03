/*

{ AccountSid: 'ACaec6c272bb7a39a4e769c463a8dd50a7',
  Body: 'Stash',
  ToZip: '11355',
  FromState: 'CT',
  ToCity: 'FLUSHING',
  SmsSid: 'SM5396f7ceb541ca96a710cc8a823db586',
  ToState: 'NY',
  To: '+17184121325',
  ToCountry: 'US',
  FromCountry: 'US',
  SmsMessageSid: 'SM5396f7ceb541ca96a710cc8a823db586',
  ApiVersion: '2010-04-01',
  FromCity: 'NORWICH',
  SmsStatus: 'received',
  From: '+18607055712',
  FromZip: '06351' }

{ AccountSid: 'ACaec6c272bb7a39a4e769c463a8dd50a7',
  Body: 'Tyujj',
  ToZip: '11355',
  FromState: 'CT',
  ToCity: 'FLUSHING',
  SmsSid: 'SMc47f0b238fd25d4456dbd05cbd5eb3b3',
  ToState: 'NY',
  To: '+17184121325',
  ToCountry: 'US',
  FromCountry: 'US',
  SmsMessageSid: 'SMc47f0b238fd25d4456dbd05cbd5eb3b3',
  ApiVersion: '2010-04-01',
  FromCity: 'NORWICH',
  SmsStatus: 'received',
  From: '+18607055712',
  FromZip: '06351' }

Messages collection
-------------------
  - date
  - from
  - message id
  - body
  - responses

Subscription collection
-----------------------
  - number

Activity collection
-------------------
  - noun
  - verb
  - stuff

*/

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