/**
  # pull-ws

  A simple (but effective) implementation of a
  [`pull-stream`](https://github.com/dominictarr/pull-stream) `Source` and `Sink`
  that is compatible both with native browser WebSockets and
  [`ws`](https://github.com/einaros/ws) created clients.

  ## Reference

**/
exports.source = require('./source');
exports.sink = require('./sink');
