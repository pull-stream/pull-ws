
var wss = require('./server')
var tape = require('tape')
require('./read');
require('./echo');
require('./closeonend');

tape('teardown', function (t) {
  wss.close()
  t.end()
})

