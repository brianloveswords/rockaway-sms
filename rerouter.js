function identity(x) { return x };
module.exports = function rerouter(paths, fallthrough) {
  function find(path) {
    var idx = paths.length;
    var regexp, fun, entry, match, meta;
    while (idx--) {
      entry = paths[idx];
      regexp = entry[0];
      fun = entry[1];
      if ((match = path.match(regexp))) {
        return fun.bind({
          input: path,
          original: fun,
          matches: match.slice(1)
        });
      }
    }
    if (fallthrough)
      return fallthrough.bind({
        input: path,
        original: fallthrough
      });
    return null;
  }

  function route(path) {
    var fun, matches;
    var result = find(path);
    if (!result)
      return;
    fun = result || identity;
    return fun();
  }

  return {
    route: route,
    find: find
  }
};