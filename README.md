# pull-ws-server

create pull stream websockets, servers, and clients.

## example

one duplex service you may want to use this with is [muxrpc](https://github.com/dominictarr/muxrpc)

``` js
var ws = require('pull-ws-server')
var pull = require('pull-stream')

ws.createServer(function (stream) {
  //pipe duplex style to your service.
  pull(stream, service.createStream(), stream)
})
.listen(9999)

var stream = ws.connect('ws://localhost:9999')

pull(stream, client.createStream(), stream)
```

to get a handle of stream end/error pass a callback to connect.

``` js
var stream = ws.connect('ws://localhost:9999', function (err) {
  if(err) throw err
  console.log('disconnected')
})


```

## License

MIT
