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
        return {fn: fun, match: match.slice(1)};
    }
    return [];
  };
  function route(path) {
    var result = find(path);
    var fun = result.fn || identity;
    var match = result.match;
    return fun.apply(fun, match);
  }
  return {
    route: route,
    find: find
  }
};