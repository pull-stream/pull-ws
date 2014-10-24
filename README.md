# pull-ws

A simple (but effective) implementation of a
[`pull-stream`](https://github.com/dominictarr/pull-stream) `Source` and `Sink`
that is compatible both with native browser WebSockets and
[`ws`](https://github.com/einaros/ws) created clients.


[![NPM](https://nodei.co/npm/pull-ws.png)](https://nodei.co/npm/pull-ws/)


[![browser support](https://ci.testling.com/DamonOehlman/pull-ws.png)](https://ci.testling.com/DamonOehlman/pull-ws)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) [![Build Status](https://img.shields.io/travis/DamonOehlman/pull-ws.svg?branch=master)](https://travis-ci.org/DamonOehlman/pull-ws) 

## Reference

### `sink(socket, opts?)`

Create a pull-stream `Sink` that will write data to the `socket`.

```js
var pull = require('pull-stream');
var ws = require('pull-ws');

// connect to the echo endpoint for test/server.js
var socket = new WebSocket('ws://localhost:3000/echo');

// write values to the socket
pull(
  pull.values([ 'hi', 'there' ]),
  ws.sink(socket)
);

socket.addEventListener('message', function(evt) {
  console.log('received: ', evt.data);
});

```

### `source(socket)`

Create a pull-stream `Source` that will read data from the `socket`.

```js
var pull = require('pull-stream');

// we just need the source, so cherrypick
var ws = require('pull-ws/source');

pull(
  // connect to the test/server.js endpoint
  ws(new WebSocket('ws://localhost:3000/read')),
  pull.log()
);

```

## License(s)

### ISC

Copyright (c) 2014, Damon Oehlman <damon.oehlman@gmail.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
