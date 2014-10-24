var pull = require('pull-core');
var ready = require('./ready');
var EOF = [];

/**
  ### `pull-ws/source(socket)`

  Create a pull-stream `Source` that will read data from the `socket`.

  <<< examples/read.js

**/
module.exports = pull.Source(function(socket) {
  var buffer = [];
  var receiver;

  socket.addEventListener('message', function(evt) {
    if (receiver) {
      return receiver(null, evt.data);
    }

    buffer.push(evt.data);
  });

  socket.addEventListener('close', function(evt) {
    if (receiver) {
      return receiver(true);
    }

    buffer.push(EOF);
  });

  function read(end, cb) {
    receiver = null;

    // if ended, abort
    if (end) {
      return cb && cb(end);
    }

    ready(socket, function(end) {
      if (end) {
        return cb(end);
      }

      // read from the socket
      if (buffer.length > 0) {
        if (buffer[0] === EOF) {
          return cb(true);
        }

        return cb(null, buffer.shift());
      }

      receiver = cb;
    });
  };

  return read;
});
