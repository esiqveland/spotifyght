var api = require('../app');
var spotifyght_util = require('../util');

var GROUPS = spotifyght_util.GROUPS;
var TRACKS = spotifyght_util.TRACKS;
var VALID_SPOTIFY_URI = spotifyght_util.VALID_SPOTIFY_URI;

var transformTrackScores = spotifyght_util.transformTrackScores;
var getUsernameFromRequest = spotifyght_util.getUsernameFromRequest;
var isLoggedIn = spotifyght_util.isLoggedIn;

var getGroupName = function (req) {
  return TRACKS + req.params.id;
};

var getVoteKey = function (groupName, username, trackName) {
  return {
    key: groupName + trackName,
    value: username
  };
};

var incrementScore = function (req, res, groupName, username, trackName, db, scorediff) {
  db.ZINCRBY(groupName, scorediff, trackName, function (err, value) {
    if (err) {
      console.log(err);
      return res.status(400).end();
    }
    if (value) {
      req.voteScore = value;
      req.io.route('change:vote');
      return res.status(200).send({uri: trackName, score: value, user: username}).end();
    }
    return res.status(404).end();
  });
};

var isValidSpotifyURI = function (uri) {
  //spotify:track:57J2znxukXsXzS3XPuZ1TG
  var split = uri.split(VALID_SPOTIFY_URI);
  return split.length === 2;
};

var deleteAllVotes = function (req, res) {
  var voteKey = getVoteKey(req.params.id, "*", req.param.track);

  req.db.DEL(voteKey.key, function(err, result) {
    if(err) {
      console.log("error deleting key: ", votekey);
    }
  });
};

exports.deleteTrack = function (req, res) {
  var db = req.db;
  if(isValidSpotifyURI(VALID_SPOTIFY_URI+req.params.track)) {
    deleteAllVotes(req, res);
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

var doVoteScoring = function(req, res, groupName, username, trackName) {
  req.db.zscore(groupName, trackName, function(err, value) {
    if(err) {
      console.log(err);
      res.status(400).end();
      return;
    }
    if(value) {
      alreadyVoted(req, res, groupName, username, trackName);
      return;
    }
    return res.status(404).send('Voting track not found').end();
  });
};

var deleteVote = function (req, res, groupName, username, trackName) {
  var voteKey = getVoteKey(groupName, username, trackName);

  req.db.HDEL(voteKey.key, voteKey.value, function (err, value) {
    if(value > 0) {
      incrementScore(req, res, groupName, username, trackName, req.db, -1);
      return;
    }
  });
};

var alreadyVoted = function(req, res, groupName, username, trackName) {
  var voteKey = getVoteKey(groupName, username, trackName);

  req.db.HSETNX(voteKey.key, voteKey.value, Date.now(), function(err, value) {
    if(err) {
      console.error(err);
      res.status(400).send('Bad! ERROR');
      return;
    }
    if(value > 0) {
      incrementScore(req, res, groupName, username, trackName, req.db, 1);
      return;
    } else {
      deleteVote(req, res, groupName, username, trackName);
      return;
    }
  });
};

exports.voteTrack = function(req, res) {
  if(!isLoggedIn(req)) {
      return res.status(401).end();
  }

  var trackName = VALID_SPOTIFY_URI+req.params.track;

  if(!isValidSpotifyURI(trackName)) {
      return res.status(400).send('invalid URI').end();
  }
  var groupName = getGroupName(req);
  var username = getUsernameFromRequest(req);

  doVoteScoring(req, res, groupName, username, trackName);

};
