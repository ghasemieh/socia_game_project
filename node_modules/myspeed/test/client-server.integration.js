'use strict';

var expect = require('chai').expect;
var sinon = require('sinon');
var EventEmitter = require('events').EventEmitter;
var Client = require('../lib/client');
var Server = require('../lib/server');

describe('myspeed/integration', function() {

  it('should perform the bandwidth test and return results', function(done) {
    this.timeout(10000);

    var server = new Server({ port: 45123 });
    var client = new Client({ url: 'ws://127.0.0.1:45123' });

    client.test(function(err, results) {
      expect(err).to.equal(null);
      expect(results.download > 0).to.equal(true);
      expect(results.upload > 0).to.equal(true);
      done();
    });
  });

  it('should cleanup and stop streams if socket closes', function(done) {
    this.timeout(10000);

    var server = new Server({ port: 45124 });
    var client = new Client({ url: 'ws://127.0.0.1:45123' });

    client.test(function(err, results) {
      expect(err.message).to.equal('Speed test ended early');
      done();
    });

    setImmediate(function() {
      client._socket.close();
    });
  });

  it('should close the connection and halt streams on error', function(done) {
    this.timeout(10000);

    var server = new Server({ port: 45125 });
    var _closeConnection = sinon.stub(server, '_closeConnection');
    var _fakeSocket = new EventEmitter();

    _fakeSocket.send = sinon.stub();
    _fakeSocket.upgradeReq = {
      headers: { 'x-forwarded-for': 'some.ip.address' }
    };

    server._handleConnection(_fakeSocket);
    _fakeSocket.emit('error', new Error('BOOM'));

    setImmediate(function() {
      expect(_closeConnection.called).to.equal(true);
      done();
    });
  });

});
