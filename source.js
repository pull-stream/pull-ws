var pull = require('pull-core');
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

    buffer[buffer.length] = evt.data;
  });

  socket.addEventListener('close', function(evt) {
    if (receiver) {
      return receiver(true);
    }

    buffer.push(EOF);
  });

  function read(end, cb) {

    function handleOpen(evt) {
      socket.removeEventListener('open', handleOpen);
      read(end, cb);
    }

    // reset the receiver
    receiver = null;

    // if ended, abort
    if (end) {
      return cb && cb(end);
    }

    // if connecting then wait
    if (socket.readyState === 0) {
      return socket.addEventListener('open', handleOpen);
    }

    // if the socket is closing or closed, return end
    if (socket.readyState >= 2) {
      return cb(true);
    }

    // read from the socket
    if (buffer.length > 0) {
      if (buffer[0] === EOF) {
        return cb(true);
      }

      return cb(null, buffer.shift());
    }

    receiver = cb;
  };

  return read;
});
