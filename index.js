/**
  # pull-ws

  A simple (but effective) implementation of a
  [`pull-stream`](https://github.com/dominictarr/pull-stream) `Source` and `Sink`
  that is compatible both with native browser WebSockets and
  [`ws`](https://github.com/einaros/ws) created clients.

  ## Reference

**/
exports = module.exports = duplex;

exports.source = require('./source');
exports.sink = require('./sink');

function duplex (ws, opts) {
  return {
    source: exports.source(ws),
    sink: exports.sink(ws, opts)
  };
};
