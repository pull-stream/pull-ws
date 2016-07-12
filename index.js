exports = module.exports = duplex;

exports.source = require('./source');
exports.sink = require('./sink');
exports.createServer = require('./server').createServer
exports.connect = require('./client').connect

function duplex (ws, opts) {
  var req = ws.upgradeReq || {}
  if(opts.binaryType)
    ws.binaryType = opts.binaryType
  else if(opts.binary)
    ws.binaryType = 'arraybuffer'
  return {
    source: exports.source(ws, opts && opts.onConnect),
    sink: exports.sink(ws, opts),

    //http properties - useful for routing or auth.
    headers: req.headers,
    url: req.url,
    upgrade: req.upgrade,
    method: req.method
  };
};

