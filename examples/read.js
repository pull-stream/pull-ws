var pull = require('pull-stream');
var ws = require('..');

pull(
  // connect to the test/server.js endpoint
  ws.source(new WebSocket('ws://localhost:3000/read')),
  pull.log()
);
