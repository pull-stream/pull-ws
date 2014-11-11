exports = module.exports = duplex;

exports.source = require('./source');
exports.sink = require('./sink');

function duplex (ws, opts) {
  return {
    source: exports.source(ws),
    sink: exports.sink(ws, opts)
  };
};
