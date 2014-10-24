module.exports = function(socket, callback) {
  var remove = socket && (socket.removeEventListener || socket.removeListener);

  function handleOpen(evt) {
    if (typeof remove == 'function') {
      remove.call(socket, 'open', handleOpen);
    }

    callback();
  }

  // if the socket is closing or closed, return end
  if (socket.readyState >= 2) {
    return cb(true);
  }

  // if open, trigger the callback
  if (socket.readyState === 1) {
    return callback();
  }

  socket.addEventListener('open', handleOpen);
};
