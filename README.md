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

To add client-authentication to the server, you can set `verifyClient`.
[Documentation here](https://github.com/websockets/ws/blob/master/doc/ws.md#optionsverifyclient).

```js
function verifyClient (info) {
  return info.secure == true
}
ws.createServer({ verifyClient: verifyClient }, onStream)
```

## use with an http server

if you have an http server that you also need to serve stuff
over, and want to use a single port, use the `server` option.

``` js
var http = require('http')
var server = http.createServer(function(req, res){...}).listen(....)
ws.createServer({server: server}, function (stream) { ... })

```

## License

MIT


