var wss = require('./server')
var tape = require('tape')

require('./all')

tape('teardown', function (t) {
  wss.close()
  t.end()
})

