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

var api = require('./routes/api');
var view = require('./routes/view');
var subscription = require('./routes/subscription');
var message = require('./routes/message');

// API endpoints
// -------------
app.post('/v1/receive', [
  api.verify
], api.capture);

app.get('/v1/messages', api.listMessages);

app.get('/v1/subscribers', [
  subscription.getAll()
], api.listSubscribers);

// User facing
// -----------
app.get('/', [
  message.getAll({ type: 'question' })
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

module.exports = http.createServer(app);
