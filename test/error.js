var test = require('tape');
var WebSocket = require('ws');
var endpoint = require('./helpers/wsurl') + '/read';
var pull = require('pull-stream');
var ws = require('../');

test('test error', function (t) {

  pull(
    pull.values(['x', 'y', 'z']),
    //attempt to connect to a server that does not exist.
    ws(new WebSocket('ws://localhost:34897/' + Math.random())),
    pull.collect(function (err) {
      t.ok(err)
      t.end()
    })
  )

})

