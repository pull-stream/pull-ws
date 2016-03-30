var ready = require('./ready');

/**
  ### `source(socket)`

  Create a pull-stream `Source` that will read data from the `socket`.

  <<< examples/read.js

**/
module.exports = function(socket) {
  var buffer = [];
  var receiver;
  var ended;

  socket.addEventListener('message', function(evt) {
    if (receiver) {
      return receiver(null, evt.data);
    }

    buffer.push(evt.data);
  });

  socket.addEventListener('close', function(evt) {
    if (ended) return;
    if (receiver) {
      return receiver(ended = true);
    }
  });

  socket.addEventListener('error', function (evt) {
    if (ended) return;
    ended = evt;
    if (receiver) {
      receiver(ended);
    }
  });

  function read(abort, cb) {
    receiver = null;

    //if stream has already ended.
    if (ended)
      return cb(ended)

    // if ended, abort
    if (abort) {
      //this will callback when socket closes
      receiver = cb
      return socket.close()
    }

    ready(socket, function(end) {
      if (end) {
        return cb(ended = end);
      }

      // read from the socket
      if (ended && ended !== true) {
        return cb(ended);
      }
      else if (buffer.length > 0) {
        return cb(null, buffer.shift());
      }
      else if (ended) {
        return cb(true);
      }

      receiver = cb;
    });
  };

  return read;
};



