'use strict';

var http = require('http');
var utils = require('./utils');
var constants = require('./constants');
var crypto = require('crypto');
var hat = require('hat');
var WritableStream = require('stream').Writable;
var RandomStream = require('noisegen');
var WebSocketServer = require('ws').Server;
var Stopwatch = require('timer-stopwatch');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

/**
 * Creates a WebSocket server for testing bandwidth
 * @constructor
 * @param {Object} options
 * @param {Number} options.port
 */
function Server(options) {
  if (!(this instanceof Server)) {
    return new Server(options);
  }

  EventEmitter.call(this);

  this._server = http.createServer(this._handleRequest.bind(this));
  this._clients = {};
  this._port = options.port || Server.DEFAULTS.port;
  this._wss = new WebSocketServer({ server: this._server });

  this._wss.on('connection', this._handleConnection.bind(this));
  this._server.listen(this._port, this._onListening.bind(this));
}

inherits(Server, EventEmitter);

Server.DEFAULTS = {
  port: 8080
};

/**
 * Handles incoming connection for speed test
 * @private
 * @param {Object} ws - Connected websocket
 */
Server.prototype._handleConnection = function(ws) {
  var self = this;
  var id = hat();
  var upstream = utils.createHasherStream(constants.UPLOAD_SIZE);
  var downstream = this._createDownloadStream();
  var uptime = new Stopwatch();
  var downtime = new Stopwatch();
  var completed = 0;
  var info = this._getConnectionInfo(ws);

  this.emit('connection', info);

  function cleanup() {
    if (completed === 2) {
      self._closeConnection(id);
      self.emit('test', {
        client: info,
        upspeed: utils.toMbps(constants.UPLOAD_SIZE / uptime.ms),
        downspeed: utils.toMbps(constants.DOWNLOAD_SIZE / downtime.ms)
      });
    }
  }

  this._clients[id] = {
    socket: ws,
    upstream: upstream,
    downstream: downstream
  };

  downtime.start();
  downstream.on('data', function(data) {
    ws.send(data, { binary: true });
  });

  upstream.on('finish', function() {
    uptime.stop();
    ws.send(JSON.stringify({
      upload: utils.toMbps(constants.UPLOAD_SIZE / uptime.ms)
    }));
    completed++;
    cleanup();
  });

  ws.on('message', function(data, flags) {
    if (flags.binary) {
      upstream.write(data);
    } else {
      try {
        data = JSON.parse(data);
      } catch (err) {
        return self._closeConnection(id);
      }

      if (data.hash === downstream.hash.toString('hex')) {
        downtime.stop();
        ws.send(JSON.stringify({
          download: utils.toMbps(constants.DOWNLOAD_SIZE / downtime.ms)
        }));
        uptime.start();
        completed++;
        cleanup();
      } else {
        return self._closeConnection(id);
      }
    }
  });

  function haltStreams() {
    uptime.stop();
    downtime.stop();
    downstream.removeAllListeners();
    upstream.removeAllListeners();
  }

  ws.on('error', function(err) {
    haltStreams();
    self._closeConnection(id);
  });

  ws.on('close', haltStreams);
};

/**
 * Returns connection information for a given socket
 * @private
 */
Server.prototype._getConnectionInfo = function(ws) {
  var addr = ws.upgradeReq.headers['x-forwarded-for'] ||
             ws.upgradeReq.connection.remoteAddress;
  var time = new Date();

  return { address: addr, timestamp: time };
};

/**
 * Destroy the socket
 * @private
 * @param {WebSocket} sock
 */
Server.prototype._closeConnection = function(id) {
  var client = this._clients[id];

  if (!client) {
    return;
  }

  client.socket.close();
  delete this._clients[id];
};

/**
 * Responds with a acknowledgement
 * @private
 */
Server.prototype._handleRequest = function(req, res) {
  res.end(JSON.stringify(require('../package')));
};

/**
 * Emits the listening event
 * @private
 */
Server.prototype._onListening = function() {
  this.emit('listening');
};

/**
 * Creates a random data stream
 * @private
 */
Server.prototype._createDownloadStream = function() {
  return new RandomStream({
    length: constants.DOWNLOAD_SIZE,
    size: 32 * 1024,
    hash: 'rmd160'
  });
};

module.exports = Server;
