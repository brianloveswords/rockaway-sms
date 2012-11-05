var express = require('express');
var http = require('http');
var path = require('path');
var template = require('./template')
var middleware = require('./middleware');

var app = express();
template.express(app);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(middleware.cookieParser());
  app.use(middleware.session());
  app.use(middleware.csrf({ whitelist: ['/v1/*'] }));
  app.use(middleware.flash());
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(middleware.requireLogin({
    whitelist: ['/v1/receive'],
    field: 'admin'
  }));
  app.use(app.router);
});
app.configure('development', function(){
  app.use(express.errorHandler());
});

const api = require('./routes/api');
const view = require('./routes/view');
const subscription = require('./routes/subscription');
const user = require('./routes/user');
const admin = require('./routes/admin');


// Model specific middleware
// -----------------------------
app.get('*', admin.checkAuth({
  whitelist: ['/login', '/logout', '/v1/receive']
}));
app.get('*', view.template());

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
  user.getById('id')
], api.userInfo);

app.post('/v1/user/:id/reply', [
  user.getById('id')
], api.replyToUser);

app.post('/v1/broadcast', api.broadcastMessage);

// User facing
// -----------
app.get('/', [
  user.getNeedy()
], view.index);

app.get('/admins', [
  admin.checkAuth({level: 'owner'}),
  admin.getAll()
], view.admin);

app.post('/admins', [
  admin.checkAuth({level: 'owner'}),
], admin.create);

app.patch('/admin/:id', [
  admin.checkAuth({level: 'owner'}),
  admin.getById(),
], admin.update);

app.delete('/admin/:id', [
  admin.checkAuth({level: 'owner'}),
  admin.getById(),
], admin.remove);


app.get('/login', view.login);
app.post('/login', admin.login);
app.get('/logout', admin.logout);
app.get('/unauthorized', view.unauthorized);

app.get('/announce', [
  admin.checkAuth({level: 'owner'}),
  user.getSubscribers()
], view.announce);

app.post('/announce', [
  user.getSubscribers()
], user.announce);

app.get('/subscribers', [
  user.getSubscribers()
], view.subscribers);

app.post('/user/:id/dismiss-latest', [
  user.getById('id')
], user.dismissLatest);

app.get('/user/:id', [
  user.getById('id')
], view.user);

app.get('/users', [
  user.getByPhone('phone')
], view.user);

app.post('/user/:id/reply', [
  user.getById('id')
], user.reply);


module.exports = http.createServer(app);
