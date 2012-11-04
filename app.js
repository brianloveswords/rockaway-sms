var express = require('express');
var http = require('http');
var path = require('path');
var template = require('./template')

var app = express();
template.express(app);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

const api = require('./routes/api');
const view = require('./routes/view');
const subscription = require('./routes/subscription');
const message = require('./routes/message');
const debug = require('./routes/debug');
const user = require('./routes/user');

// API endpoints
// -------------
app.post('/v1/receive', [
  api.verify,
  api.capture,
], api.respond );

app.get('/v1/users', [
  user.getAll({exclude: ['messages']})
],api.listUsers);

app.get('/v1/users/subscribers', [
  user.getSubscribers()
], api.listSubscribers);

app.get('/v1/users/needy', [
  user.getNeedy()
], api.listNeedy);

app.get('/v1/user/:id', [
  user.getOne('id')
], api.userInfo);

app.post('/v1/user/:id/reply', [
  user.getOne('id')
], api.replyToUser);

app.post('/v1/broadcast', api.broadcastMessage);

// User facing
// -----------
app.get('/', [
  user.getNeedy()
], view.index);

app.get('/announce', [
  subscription.getAll()
], view.announce);

app.post('/announce', [
  subscription.getAll()
], subscription.announce);

app.get('/subscribers', [
  subscription.getAll()
], view.subscribers);

app.delete('/message/:id', [
  message.getFromParam('id')
], message.dismiss);

app.get('/message/:id', [
  message.getFromParam('id')
], view.viewMessage);

app.post('/message/:id/reply', [
  message.getFromParam('id')
], message.reply);

// Debugging
// ---------
app.get('/debug/message', view.testMessage);
app.post('/debug/message', debug.saveMessage);

module.exports = http.createServer(app);
