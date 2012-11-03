function identity(x) { return x };
module.exports = function rerouter(paths) {
  function find(path) {
    var idx = paths.length;
    var regexp, fun, entry, match;
    while (idx--) {
      entry = paths[idx];
      regexp = entry[0];
      fun = entry[1];
      if ((match = path.match(regexp)))
        return {fn: fun, matches: match.slice(1)};
    }
    return null;
  };
  function route(path) {
    var fun, matches;
    var result = find(path);
    if (!result)
      return;
    fun = result.fn || identity;
    matches = result.matches;
    return fun.call({matches: matches});
  }
  return {
    route: route,
    find: find
  }
};