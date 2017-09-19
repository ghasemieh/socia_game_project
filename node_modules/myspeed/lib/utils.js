/**
 * @module myspeed/utils
 */

'use strict';

var crypto = require('crypto');
var WritableStream = require('stream').Writable;

/**
 * Creates a stream that hashes input
 * @param {Number} size - Bytes to allocate
 */
module.exports.createHasherStream = function(size) {
  var stream = new WritableStream({
    write: function(chunk, enc, next) {
      if (this.bytes === size) {
        return false;
      }

      if (this.bytes + chunk.length > size) {
        chunk = chunk.slice(0, size - this.bytes);
      }

      this.hash.update(chunk);
      this.bytes += chunk.length;

      if (this.bytes === size) {
        this.hash = this.hash.digest();
        this.emit('finish');
      } else {
        next();
      }
    }
  });

  stream.hash = crypto.createHash('rmd160');
  stream.bytes = 0;

  return stream;
};

/**
 * Converts the bytes per millisecond to megabits per second
 * @param {Number} bytesPerMs
 */
module.exports.toMbps = function(bytesPerMs) {
  return ((bytesPerMs * 8) / 1000).toFixed(2);
};
