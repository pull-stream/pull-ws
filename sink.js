var pull = require('pull-core');
var ready = require('./ready');

/**
  ### `sink(socket, opts?)`

  Create a pull-stream `Sink` that will write data to the `socket`.

  <<< examples/write.js

**/
module.exports = pull.Sink(function(read, socket, opts) {
  var closeOnEnd = (opts || {}).closeOnEnd;

  function next(end, data) {
    // if the stream has ended, simply return
    if (end) {
      if (closeOnEnd && socket.readyState <= 1) {
        socket.close();
      }

      return;
    }

    // socket ready?
    ready(socket, function(end) {
      if (end) {
        return read(end);
      }

      socket.send(data);
      process.nextTick(function() {
        read(null, next);
      });
    });
  }

  read(null, next);
});
