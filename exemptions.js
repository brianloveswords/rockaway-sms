
function Exemptions(array) {
  if (!(this instanceof Exemptions))
    return new Exemptions(array);
  array = array || [];
  this._list = array.map(function (entry) {
    if (typeof entry === 'string') {
      entry = entry.replace(/\*/g, '.*?');
      return RegExp('^' + entry + '$');
    }
    return entry;
  });
};

Exemptions.check = function isExempt(whitelist, path) {
  var i = whitelist.length;
  while (i--) {
    if (whitelist[i].test(path))
      return true;
  }
  return false;
};

Exemptions.prototype.check = function check(path) {
  return Exemptions.check.bind(null, this._list)(path);
};

module.exports = Exemptions;