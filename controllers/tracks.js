var api = require('../app');

var GROUPS = "group:";
var TRACKS = GROUPS+"tracks:";
var VALID_SPOTIFY_URI = "spotify:track:";


var incrementScore = function (req, res) {
  var db = req.db;
  db.ZINCRBY(TRACKS + req.params.id, 1, VALID_SPOTIFY_URI + req.params.track, function (err, value) {
    if (err) {
      console.log(err);
      return res.status(400).end();
    }
    if (value) {
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

exports.getGroupInfo = function (req, res) {
  var db = req.db;
  db.get(GROUPS + req.params.id, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).end();
    }
    console.log(result);
    if (result) {
      res.send({result: result});
    }
    res.status(404).end();
  });

};

exports.createGroup = function (req, res) {
  console.log("body: ");
  console.log(req.body);
  if(!req.body || !req.body.secret || !req.body.secret) {
    res.status(400).end;
    return;
  }
  var db = req.db;

  db.hsetnx(GROUPS + req.params.id, 'secret', req.body.secret, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).end();
    }
    if (result === 0) {
      res.status(409).end();
    }
    res.status(201).end();
  });
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

  db.ZREVRANGEBYSCORE(TRACKS+req.params.id, "+inf", "-inf", 'WITHSCORES', function(err, tracks) {
    if(err) {
      console.log(err);
      return res.status(400).end();
    }
    if(tracks) {
      res.send({scores: tracks});
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
      }
      if(value) {
        res.status(200).send({uri: VALID_SPOTIFY_URI+req.params.track, score: value}).end();
      }
      res.status(404).end();
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
