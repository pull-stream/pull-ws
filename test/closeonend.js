var test = require('tape');
var WebSocket = require('ws');
var endpoint = require('./helpers/wsurl') + '/echo';
var pull = require('pull-stream');
var ws = require('..');

test('websocket closed when pull source input ends', function(t) {
  var socket = new WebSocket(endpoint);

  t.plan(1);

  pull(
    ws.source(socket),
    pull.collect(function(err) {
      t.ifError(err, 'closed without error');
    })
  );

  pull(
    pull.values(['x', 'y', 'z']),
    ws.sink(socket, { closeOnEnd: true })
  );
});
