#!/usr/bin/env node
// bash: redis-server /usr/local/etc/redis.conf

if(!process.env.SESSION_SECRET) {
    throw new Error("env.SESSION_SECRET not set.");
}

var app = require('./app');

app.set('port', process.env.PORT || 3001);
app.set('env', process.env.ENV || 'development');

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

// app middleware
//var app = express();
//app.use(express.static(__dirname + config.static.dir));
