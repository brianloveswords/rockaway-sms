exports.index = function index (req, res) {
  res.render('index.html', {
    page: 'home'
  });
};
exports.announce = function announce (req, res) {
  res.render('announce.html', {
    page: 'announce',
    subscribers: req.subscribers
  });
};
exports.subscribers = function subscribers (req, res) {
  res.render('subscribers.html', {
    page: 'subscribers',
    subscribers: req.subscribers
  });
};

