exports.index = function index (req, res) {
  res.render('index.html');
};
exports.announce = function announce (req, res) {
  res.render('announce.html');
};
exports.subscribers = function subscribers (req, res) {
  
  res.render('subscribers.html', {
    subscribers: req.subscribers
  });
};

