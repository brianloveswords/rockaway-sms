exports.index = function index (req, res) {
  res.render('index.html', {
    page: 'home',
    messages: req.messages,
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
exports.testMessage = function testMessage (req, res) {
  res.render('test-message.html', {
    page: 'test-message',
  });
};
exports.viewMessage = function viewMessage (req, res) {
  res.render('view-message.html', {
    page: 'view-message',
    message: req.message,
  });
};
