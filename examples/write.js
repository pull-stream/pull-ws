var pull = require('pull-stream');
var ws = require('..');

// connect to the echo endpoint for test/server.js
var socket = new WebSocket('ws://localhost:3000/echo');

// write values to the socket
pull(
  pull.values([ 'hi', 'there' ]),
  ws.sink(socket)
);

socket.addEventListener('message', function(evt) {
  console.log('received: ', evt.data);
});
