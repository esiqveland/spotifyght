var express = require('express.io');
var logger = require('morgan');
var bodyParser = require('body-parser');

var ping = require('./routes/ping');
var cors = require('./routes/cors');
var tracks = require('./controllers/tracks');
var groups = require('./controllers/groups');
var myUtil = require('./util');


var config = {
    api: { port: 3001 },
    static: { dir: '/public', port: 3000 },
    redis: {
      host: '10.0.1.2',
      port: 6379
    }
};

var api = express();
api.http().io();

var db = require('./db')(config);
// Make our db accessible to our router
api.use(function(req,res,next){
  req.db = db;
  next();
});

api.use(logger('dev'));
api.use(bodyParser.json());

api.all('*', cors.setup);

api.get('/ping', ping.index);

api.use(function (req, res, next) {
    var ua = req.headers['user-agent'];
    db.zadd('online', Date.now(), ua, next);
});

api.use(function(req, res, next) {
    var min = 60*1000;
    var ago = Date.now() - min;
    db.zrevrangebyscore('online', '+inf', ago, function(err, users) {
        if(err) {
            return next(err);
        }
        req.online = users;
        next();
    });
});

api.get('/online', function(req, res) {
    res.send({online: req.online.length});
});

api.get('/group/:id', groups.getGroupInfo);
api.post('/group/:id', groups.createGroup);
api.delete('/group/:id', groups.deleteGroup);

api.post('/group/:id/tracks', tracks.addTrack);
api.get('/group/:id/tracks', tracks.indexTracks);
api.get('/group/:id/:track/vote', tracks.getTrackScore);
api.post('/group/:id/:track/vote', tracks.voteTrack);
api.delete('/group/:id/:track');

api.io.route('songadded', function(req) {
  console.log('songadded in room: '+req.params.id);
  console.log(req.body);
  api.io.room(req.params.id).broadcast('songadded', {message: req.body.uri});
});

api.io.route('vote:remove', function(req) {
  console.log('songRemoved in room: '+req.params.id + ' id: '+req.params.track);
  api.io.room(req.params.id).broadcast('vote:remove', {id:myUtil.VALID_SPOTIFY_URI+req.params.track});
});

api.io.route('change:vote', function(req) {
  console.log('songVoted in room: '+req.params.id);
  console.log(req.body);
  api.io.room(req.params.id).broadcast('change:vote', {id:myUtil.VALID_SPOTIFY_URI+req.params.track, score: req.voteScore});
});

api.io.route('ready', function(req) {
  if(!req.data.group) {
    return;
  }
  var group = req.data.group;
  console.log("new client in room: "+group);
  req.io.join(group);
});
// catch 404 and forward to error handler
api.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
//if (api.get('env') === 'development') {
//    api.use(function(err, req, res, next) {
//        res.status(err.status || 500);
//        res.send({error: {
//          message: err.message,
//          error: err
//        }});
//    });
//}
//
// production error handler
// no stacktraces leaked to user
//api.use(function(err, req, res, next) {
//    res.status(err.status || 500);
//    res.send({error: {
//      message: err.message,
//      error: {}
//    }});
//
//});

module.exports = api;
