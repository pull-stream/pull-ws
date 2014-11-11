var test = require('tape');
var WebSocket = require('ws');
var pull = require('pull-stream');
var ws = require('..');
var url = require('./helpers/wsurl') + '/echo'

test('setup echo reading and writing', function(t) {
  var socket = new WebSocket(url);
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


test('duplex style', function(t) {
  var expected = ['x', 'y', 'z'];
  var socket = new WebSocket(url);

  t.plan(expected.length);

  pull(
    pull.values([].concat(expected)),
    ws(socket),
    pull.drain(function(value) {
      t.equal(value, expected.shift());
    })
  );

});

