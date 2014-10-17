var express = require('express.io');
var logger = require('morgan');
var cookieParser = require('cookie-parser')();
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

var SECRET = process.env.SESSION_SECRET;

var config = {
    api: { port: 3001 },
    static: { dir: '/public', port: 3000 },
    redis: {
      //host: '10.0.1.100',
      host: 'redis',
      port: 6379
    }
};


var ping = require('./routes/ping');
var cors = require('./routes/cors');
var tracks = require('./controllers/tracks');
var groups = require('./controllers/groups');
var myUtil = require('./util');

var db = require('./db')(config);
var sessionStore = session( {
    store: new RedisStore({ client: db }),
        secret: SECRET,
        cookie: { secure: false }
    }
);

// express io
var api = express().http().io();

api.use(logger('dev'));

api.use(cors.setup);

api.use(cookieParser);
api.use(sessionStore);
// session existense check
api.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error('oh no')); // handle error
  }
  next(); // otherwise continue
});

// attach sessions to pure websocket requests
api.io.use(function(req, next) {
  var res = {};
  cookieParser(req, res, function(err) {
      if (err) {
        return next(err);
      }
      sessionStore(req, res, next);
  });
});


api.use(bodyParser.json());


// Make our db accessible to our router
api.use(function(req,res,next){
  req.db = db;
  next();
});

// count users online
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

api.get('/ping', ping.index);

api.get('/group/:id', groups.getGroupInfo);
api.post('/group/:id', groups.createGroup);
api.delete('/group/:id', groups.deleteGroup);

api.post('/group/:id/tracks', tracks.addTrack);
api.get('/group/:id/tracks', tracks.indexTracks);
api.get('/group/:id/:track/vote', tracks.getTrackScore);
api.post('/group/:id/:track/vote', tracks.voteTrack);
api.delete('/group/:id/:track', tracks.deleteTrack);

api.io.route('songadded', function(req) {
  console.log('songadded in room: '+req.params.id + ' by '+req.session.username);
  console.log(req.body);
  api.io.room(req.params.id).broadcast('songadded', {id: req.body.uri, score: req.songScore});
});

api.io.route('track:deleted', function(req) {
  console.log('songRemoved in room: '+req.params.id + ' id: '+req.params.track);
  api.io.room(req.params.id).broadcast('track:deleted', {id:myUtil.VALID_SPOTIFY_URI+req.params.track});
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
  req.io.join(group);
  if(req.session) {
    console.log("new client in room: "+group + " username: " + req.session.username);
  }
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
if (api.get('env') === 'development') {
    api.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({error: {
          message: err.message,
          error: err
        }});
    });
}
//
// production error handler
// no stacktraces leaked to user
api.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({error: {
      message: err.message,
      error: {}
    }});

});

module.exports = api;
