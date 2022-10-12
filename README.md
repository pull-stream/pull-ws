# it-ws <!-- omit in toc -->

[![codecov](https://img.shields.io/codecov/c/github/alanshaw/it-ws.svg?style=flat-square)](https://codecov.io/gh/alanshaw/it-ws)
[![CI](https://img.shields.io/github/workflow/status/alanshaw/it-ws/test%20&%20maybe%20release/master?style=flat-square)](https://github.com/alanshaw/it-ws/actions/workflows/js-test-and-release.yml)

> Simple async iterables for websocket client connections

## Table of contents <!-- omit in toc -->

- [Install](#install)
- [Usage](#usage)
  - [Example - client](#example---client)
  - [Example - server](#example---server)
- [API](#api)
  - [`import { connect } from 'it-ws/client'`](#import--connect--from-it-wsclient)
  - [`import { createServer } from 'it-ws/server'`](#import--createserver--from-it-wsserver)
    - [Example](#example)
- [use with an http server](#use-with-an-http-server)
  - [core, websocket wrapping functions](#core-websocket-wrapping-functions)
  - [`import duplex from 'it-ws/duplex'`](#import-duplex-from-it-wsduplex)
  - [`import sink from 'it-ws/sink'`](#import-sink-from-it-wssink)
  - [`import source from 'it-ws/source'`](#import-source-from-it-wssource)
- [License](#license)
- [Contribute](#contribute)

## Install

```console
$ npm i it-ws
```

## Usage

### Example - client

```js
import { connect } from 'it-ws/client'
import { pipe } from 'it-pipe'

const stream = connect(WS_URL)

await stream.connected() // Wait for websocket to be connected (optional)

pipe(source, stream, sink)
```

### Example - server

```js
import { createServer } from 'it-ws/server'
import { pipe } from 'it-pipe'

const server = createServer(stream => {
  //pipe the stream somewhere.
  //eg, echo server
  pipe(stream, stream)
})

await server.listen(PORT)
```

## API

### `import { connect } from 'it-ws/client'`

`connect(url, { binary: boolean })`

Create a websocket client connection. Set `binary: true` to get a stream of arrayBuffers (on the browser). Defaults to true on node, but to strings on the browser. This may cause a problems if your application assumes binary.

For adding options to the WebSocket instance, as [websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options](https://github.com/websockets/ws/blob/master/doc/ws.md#new-websocketaddress-protocols-options), you can provide an object with the `websocket` property into the connect options.

```js
const stream = connect(url)
// stream is duplex and is both a `source` and `sink`.
// See this for more information:
// https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#duplex-it
```

### `import { createServer } from 'it-ws/server'`

Create async iterable websocket servers.

`createServer(options?, onConnection)`

`options` takes the same server options as [ws module](https://github.com/websockets/ws/blob/master/doc/ws.md#new-wsserveroptions-callback)

`onConnection(stream)` is called every time a connection is received.

#### Example

One duplex service you may want to use this with is [muxrpc](https://github.com/dominictarr/muxrpc)

```js
import { createServer } from 'it-ws/server'
import { connect } from 'it-ws/client'
import { pipe } from 'it-pipe'

createServer({
  onConnection: (stream) => {
    // pipe duplex style to your service
    pipe(stream, service.createStream(), stream)
  }
})
.listen(9999)

const stream = client.createStream()

await pipe(
  stream,
  connect('ws://localhost:9999'),
  stream
)
```

if the connection fails, the stream will throw

```js
try {
  await pipe(
    stream,
    connect('ws://localhost:9999'),
    stream
  )
} catch (err) {
  // handle err
}
```

To run the server over TLS:

```js
createServer({
  key: fs.readFileSync('test/fixtures/keys/agent2-key.pem'),
  cert: fs.readFileSync('test/fixtures/keys/agent2-cert.pem')
  // other options
})
.listen(9999)
```

To add client-authentication to the server, you can set `verifyClient`.
[Documentation here](https://github.com/websockets/ws/blob/master/doc/ws.md#optionsverifyclient).

```js
function verifyClient (info) {
  return info.secure == true
}
createServer({
  verifyClient: verifyClient
  // other options
})
```

## use with an http server

if you have an http server that you also need to serve stuff
over, and want to use a single port, use the `server` option.

```js
import http from 'http'

const server = http.createServer(function(req, res){...}).listen(....)

createServer({
  server: server
  // other options
})
```

### core, websocket wrapping functions

these modules are used internally, to wrap a websocket.
you probably won't need to touch these,
but they are documented anyway.

### `import duplex from 'it-ws/duplex'`

turn a websocket into a duplex stream.
If provided, `opts` is passed to `sink(socket, opts)`.

WebSockets do not support half open mode.
[see allowHalfOpen option in net module](http://nodejs.org/api/net.html#net_net_createserver_options_connectionlistener)

If you have a protocol that assumes halfOpen connections, but are using
a networking protocol like websockets that does not support it, I suggest
using [it-goodbye](https://github.com/alanshaw/it-goodbye) with your
protocol.

The duplex stream will also contain a copy of the properties from
the http request that became the websocket. they are `method`, `url`,
`headers` and `upgrade`.

also exposed at: `import { duplex } from 'it-ws'`

### `import sink from 'it-ws/sink'`

Create a `Sink` that will write data to the `socket`.
`opts` may be `{closeOnEnd: true, onClose: onClose}`.
`onClose` will be called when the sink ends. If `closeOnEnd=false`
the stream will not close, it will just stop emitting data.
(by default `closeOnEnd` is true)

If `opts` is a function, then `onClose = opts; opts.closeOnEnd = true`.

```js
import sink from 'it-ws/sink'
import { pipe } from 'it-pipe'
import each from 'it-foreach'
import delay from 'delay'

// connect to the echo endpoint for test/server.js
var socket = new WebSocket('wss://echo.websocket.org')

// write values to the socket
pipe(
  async function * () {
    while (true) {
      yield 'hello @ ' + Date.now()
    }
  }(),
  // throttle so it doesn't go nuts
  (source) => each(source, () => delay(100))
  sink(socket)
);

socket.addEventListener('message', function(evt) {
  console.log('received: ' + evt.data);
});
```

also exposed at `import { sink } from 'it-ws'`

### `import source from 'it-ws/source'`

Create a `Source` that will read data from the `socket`.

```js
import { pipe } from 'it-pipe'
import source from 'it-ws/source'
import { toString } from 'uint8arrays/to-string'

pipe(
  // connect to the test/server.js endpoint
  source(new WebSocket('ws://localhost:3000/read')),
  async (source) => {
    for await (const buf of source) {
      console.info(toString(buf))
    }
  }
);

```

also exposed at `import { source } from 'it-ws'`

## License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

## Contribute

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
