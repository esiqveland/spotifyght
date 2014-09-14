#!/usr/bin/env node
var app = require('./app');

app.set('port', process.env.PORT || 3001);
app.set('env', process.env.ENV || 'development');

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});

// app middleware
//var app = express();
//app.use(express.static(__dirname + config.static.dir));
