exports = module.exports = require('./duplex')

exports.source = require('./source');
exports.sink = require('./sink');
exports.createServer = require('./server').createServer
exports.connect = require('./client').connect
