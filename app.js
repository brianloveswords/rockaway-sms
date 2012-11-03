var express = require('express');
var http = require('http');
var path = require('path');
var api = require('./routes/api');
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
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

// API endpoints
// -------------
app.post('/v1/receive', [
  api.verify
], api.capture);
app.get('/v1/messages', api.listMessages);


// User facing
// -----------
app.get('/', function (req, res) {
  res.send('sms app for rockawayhelp.com');
});

module.exports = http.createServer(app);
