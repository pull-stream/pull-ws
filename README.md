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

if the connection fails, the first read from the stream will be an error,
otherwise, to get a handle of stream end/error pass a callback to connect.

``` js
ws.connect('ws://localhost:9999', function (err, stream) {
  if(err) return handleError(err)
  //stream is now ready
})

```

To run the server over TLS:

```js
var tlsOpts = {
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
};
ws.createServer(tlsOpts, function (stream) {
  //pipe duplex style to your service.
  pull(stream, service.createStream(), stream)
})
.listen(9999)
```

## License

MIT


