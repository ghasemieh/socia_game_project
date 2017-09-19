'use strict';

var utils = require('./utils');
var constants = require('./constants');
var crypto = require('crypto');
var WritableStream = require('stream').Writable;
var RandomStream = require('noisegen');
var WebSocketClient = require('ws');

/**
 * Creates a WebSocket speed test client
 * @constructor
 * @param {Object} options
 * @param {String} options.url
 */
function Client(options) {
  if (!(this instanceof Client)) {
    return new Client(options);
  }

  this._url = options.url;
}

/**
 * Performs a bandwidth test
 * @param {Function} callback
 */
Client.prototype.test = function(callback) {
  var ws = this._socket = new WebSocketClient(this._url);

  var downstream = utils.createHasherStream(constants.DOWNLOAD_SIZE);
  var upstream = this._createUploadStream();
  var results = { upload: null, download: null };

  function cleanup() {
    if (results.download !== null && results.upload !== null) {
      callback(null, results);
    } else {
      callback(new Error('Speed test ended early'));
    }
  }

  downstream.on('finish', function() {
    ws.send(JSON.stringify({
      hash: downstream.hash.toString('hex')
    }));
    upstream.on('data', function(data) {
      ws.send(data, { binary: true });
    });
  });

  ws.on('message', function(data, flags) {
    if (flags.binary) {
      downstream.write(data);
    } else {
      try {
        data = JSON.parse(data);
      } catch (err) {
        return callback(err);
      }

      results.download = data.download || results.download;
      results.upload = data.upload || results.upload;
    }
  });

  ws.on('close', cleanup);
  ws.on('error', callback);
};

/**
 * Creates a random data stream
 * @private
 */
Client.prototype._createUploadStream = function() {
  return new RandomStream({
    length: constants.UPLOAD_SIZE,
    size: 8 * 1024,
    hash: 'rmd160'
  });
};

module.exports = Client;
