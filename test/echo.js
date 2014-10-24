var test = require('tape');
var WebSocket = require('ws');
var pull = require('pull-stream');
var ws = require('..');
var socket = new WebSocket(require('./helpers/wsurl') + '/echo');

test('setup echo reading and writing', function(t) {
  var expected = ['x', 'y', 'z'];

  t.plan(expected.length);

  pull(
    ws.source(socket),
    pull.drain(function(value) {
      t.equal(value, expected.shift());
    })
  );

  pull(
    pull.values([].concat(expected)),
    ws.sink(socket)
  );
});

test('close the socket', function(t) {
  t.plan(1);
  socket.addEventListener('close', t.pass.bind(t, 'closed'));
  socket.close();
});
