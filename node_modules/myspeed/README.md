MySpeed
=======

[![Build Status](https://img.shields.io/travis/gordonwritescode/myspeed.svg?style=flat-square)](https://travis-ci.org/gordonwritescode/myspeed)
[![Coverage Status](https://img.shields.io/coveralls/gordonwritescode/myspeed.svg?style=flat-square)](https://coveralls.io/r/gordonwritescode/myspeed)
[![NPM](https://img.shields.io/npm/v/myspeed.svg?style=flat-square)](https://www.npmjs.com/package/myspeed)

Simple bandwidth and speed testing client and server.

Programmatic Usage
------------------

Install locally with NPM:

```
npm install myspeed --save
```

### Server

```js
var Server = require('myspeed').Server;
var server = new Server({ port: 8080 });

// That's it!
```

### Client

```js
var Client = require('myspeed').Client;
var client = new Client({ url: 'ws://127.0.0.1:8080' });

client.test(function(err, result) {
  console.log(result); // { download: Number, upload: Number }
});
```

Command Line Interface
----------------------

Install globally with NPM:

```
npm install myspeed --global
```

### Server

```
myspeed server 8080
```

### Client

```
myspeed client 127.0.0.1:8080
```

License
-------

MySpeed - Simple bandwidth and speed testing client and server.  
Copyright (C) 2016  Gordon Hall

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see http://www.gnu.org/licenses/.
