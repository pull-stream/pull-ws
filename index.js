exports = module.exports = duplex;

exports.source = require('./source');
exports.sink = require('./sink');

function duplex (ws, opts) {
  var req = ws.upgradeReq || {}
  return {
    source: exports.source(ws),
    sink: exports.sink(ws, opts),

    //http properties - useful for routing or auth.
    headers: req.headers,
    url: req.url,
    upgrade: req.upgrade,
    method: req.method
  };
};

