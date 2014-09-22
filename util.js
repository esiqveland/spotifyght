// util.js
var GROUPS = "group:";
var TRACKS = GROUPS+"tracks:";
var VALID_SPOTIFY_URI = "spotify:track:";

var transformTrackScores = function(trackList) {
  var list = [];
  for(var i = 0; i < trackList.length/2; i++) {
      list.push({id: trackList[2*i], score: parseInt(trackList[(2*i)+1]) } );
  }
  return list;
};

var isValidSpotifyURI = function (uri) {
  //spotify:track:57J2znxukXsXzS3XPuZ1TG
  var split = uri.split(VALID_SPOTIFY_URI);
  return split.length === 2;
};

var isLoggedIn = function(req) {
  if(!req.session) {
      return false;
  }
  if(!req.session.username) {
      return false;
  }
  return true;
};

var getUsernameFromRequest = function(req) {
    return req.session.username;
}
module.exports = {
	GROUPS: GROUPS,
	TRACKS: TRACKS,
	transformTrackScores: transformTrackScores,
	VALID_SPOTIFY_URI: VALID_SPOTIFY_URI,
    isLoggedIn: isLoggedIn,
    getUsernameFromRequest: getUsernameFromRequest
}
