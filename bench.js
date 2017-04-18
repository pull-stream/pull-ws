var WS = require('./')
var pull = require('pull-stream')

var server = WS.createServer(function (stream) {
  pull(stream, stream)
}).listen(5678, function () {

  var stream = WS.connect('ws://localhost:5678', {onConnect: function (err, stream) {

    var pushable = require('pull-pushable')()
    var D = 1024*10, ts = Date.now(), _ts = Date.now(), l = 0, _l = 0, c = 0, _c = 0

    pushable.push(new Buffer(D))
    pull(
      pushable,
      stream,
      pull.drain(function (m) {
        l += m.length, c++
        ts = Date.now()
        if(ts > _ts + 1000) {
          console.log(l - _l, c - _c, ts - _ts)
          _ts = ts
          _l = l
          _c = c
        }

        pushable.push(new Buffer(D))

      })
    )


  }})

})




