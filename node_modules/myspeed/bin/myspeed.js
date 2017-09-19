#!/usr/bin/env node

'use strict';

var http = require('http');
var program = require('commander');
var Server = require('../lib/server');
var Client = require('../lib/client');

program.version(require('../package').version);

program
  .command('client <url>')
  .description('open a speed test with the supplied server')
  .action(function createClient(url) {
    console.log();

    console.log('Running Speed Test ∙∙∙∙∙·▫▫ᵒᴼᵒ▫ₒₒ▫ᵒᴼᵒ▫ₒₒ▫ᵒᴼᵒ☼)===>');

    return Client({ url: 'ws://' + url }).test(function(err, result) {
      if (err) {
        console.log('[error]', err.message);
        process.exit();
      }

      console.log('                                           ');
      console.log('+-----------------------------------------+');
      console.log('| * Download Speed: %d Mbps', result.download);
      console.log('| * Upload Speed:   %d Mbps', result.upload  );
      console.log('+-----------------------------------------+');
      console.log('                                           ');
    });
  });

program
  .command('server [port]')
  .description('start a speed test server that clients can use')
  .action(function createServer(port) {
    return Server({ port: port }).on('listening', function() {
      console.log(JSON.stringify({
        message: 'server running on port ' + port || Server.DEFAULTS.port,
        meta: {},
        timestamp: new Date()
      }));
    }).on('connection', function(info) {
      console.log(JSON.stringify({
        message: 'client connected for speed test',
        meta: info,
        timestamp: new Date()
      }));
    }).on('test', function(result) {
      console.log(JSON.stringify({
        message: 'client completed speed test',
        meta: result,
        timestamp: new Date()
      }));
    });
  });

program.parse(process.argv);

if (process.argv.length < 3) {
  return program.help();
}
