#!/usr/bin/env node
// bash: redis-server /usr/local/etc/redis.conf

if(!process.env.SESSION_SECRET) {
  throw new Error("env.SESSION_SECRET not set.");
}

var config = require('./config');
var app = require('./app');

var server = app.listen(config.port, function() {
  console.log('Express server listening on port ' + server.address().port + ' in ENVIRONMENT: '+ app.get('env'));
});
