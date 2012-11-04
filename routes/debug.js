var Message = require('../models/message');

exports.saveMessage = function saveMessage (req, res) {
  var form = req.body;
  var message = new Message({
    body: form.body,
    from: '+' + form.from.replace('+', ''),
    smsId: 'ey yoooooooo',
    type: 'question'
  });
  message.save(function (err) {
    if (err)
      return res.send(500, err);
    return res.redirect('/')
  });
};
