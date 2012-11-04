exports.index = function index (req, res) {
  res.render('index.html', {
    page: 'home',
    users: req.users,
  });
};
exports.announce = function announce (req, res) {
  res.render('announce.html', {
    page: 'announce',
    subscribers: req.subscribers,
  });
};
exports.subscribers = function subscribers (req, res) {
  res.render('subscribers.html', {
    page: 'subscribers',
    subscribers: req.subscribers,
  });
};
exports.user = function user(req, res) {
  const user = req.user;
  res.render('user.html', {
    page: 'user',
    user: user,
    messages: user.messages.reverse()
  });
};
