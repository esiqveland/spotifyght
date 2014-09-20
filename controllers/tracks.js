var api = require('../app');
var spotifyght_util = require('../util');

var GROUPS = spotifyght_util.GROUPS;
var TRACKS = spotifyght_util.TRACKS;
var VALID_SPOTIFY_URI = spotifyght_util.VALID_SPOTIFY_URI;

var transformTrackScores = spotifyght_util.transformTrackScores;

var incrementScore = function (req, res) {
  var db = req.db;
  db.ZINCRBY(TRACKS + req.params.id, 1, VALID_SPOTIFY_URI + req.params.track, function (err, value) {
    if (err) {
      console.log(err);
      return res.status(400).end();
    }
    if (value) {
      req.voteScore = value;
      req.io.route('change:vote');
      return res.status(200).send({uri: VALID_SPOTIFY_URI + req.params.track, score: value}).end();
    }
    return res.status(404).end();
  });
};

var isValidSpotifyURI = function (uri) {
  //spotify:track:57J2znxukXsXzS3XPuZ1TG
  var split = uri.split(VALID_SPOTIFY_URI);
  return split.length === 2;
};

exports.deleteTrack = function (req, res) {
  var db = req.db;
  if(isValidSpotifyURI(VALID_SPOTIFY_URI+req.params.track)) {
    db.ZREM(TRACKS+req.params.id, VALID_SPOTIFY_URI+req.params.track, function(err, result) {
        if(err) {
          console.log(err);
          res.status(404).end();
          throw err;
        }
        if(result > 0) {
          req.io.route('track:deleted');
          res.status(200).send('OK');
          return;
        }
        res.status(404).end();
    });
  }
};

exports.addTrack = function (req, res) {
  var db = req.db;

  if (isValidSpotifyURI(req.body.uri)) {
    db.zscore(TRACKS + req.params.id, req.body.uri, function (err, value) {
      if (err) {
        console.log(err);
        res.status(400).end();
        return;
      }
      if (value) {
        res.status(409).end();
        return;
      }

      db.zadd(TRACKS + req.params.id, 1, req.body.uri, function (err, value) {
        if (err) {
          console.log(err);
          res.status(400).end();
          return;
        }
        if (value > 0) {
          req.songScore = value;
          req.io.route('songadded');
          res.status(201).end();
          return;
        }
        res.status(400).send("unknown error").end();
      });

    });
  } else {
    res.status(422).end();
  }
};

exports.indexTracks = function(req, res) {
  var db = req.db;

  console.log("username: " + req.session.username);

  db.ZREVRANGEBYSCORE(TRACKS+req.params.id, "+inf", "-inf", 'WITHSCORES', function(err, tracks) {
    if(err) {
      console.log(err);
      return res.status(400).end();
    }
    if(tracks) {
      res.send({
        scores: transformTrackScores(tracks)
      });
    } else {
      res.status(404).end();
    }
  });
};

exports.getTrackScore = function(req, res) {
  var db = req.db;

  if(isValidSpotifyURI(VALID_SPOTIFY_URI+req.params.track)) {
    db.zscore(TRACKS+req.params.id, VALID_SPOTIFY_URI+req.params.track, function(err, value) {
      if(err) {
        console.log(err);
        res.status(400).end();
        return;
      }
      if(value) {
        return res.status(200).send({uri: VALID_SPOTIFY_URI+req.params.track, score: value}).end();
      }
      return res.status(404).end();
    });
  }
};

exports.voteTrack = function(req, res) {
  var db = req.db;

  if(isValidSpotifyURI(VALID_SPOTIFY_URI+req.params.track)) {
    db.zscore(TRACKS+req.params.id, VALID_SPOTIFY_URI+req.params.track, function(err, value) {
      if(err) {
        console.log(err);
        res.status(400).end();
      }
      if(value) {
        return incrementScore(req, res);
      }
      return res.status(404).end();
    });
  }
};
