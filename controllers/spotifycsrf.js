var request = require('request');

var oauthTokenUrl = 'https://open.spotify.com';
var oauthTokenPath = '/token';

var spotify_csrf_proxy = function(req, res, next) {
  getToken(function(err, body) {
    if(err) {
      next(new Error(error));
      return;
    }
    var obj = JSON.parse(body);
    res.status(200);
    res.send(obj);
  });
};

function getToken(callback) {
  request(oauthTokenUrl+oauthTokenPath, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      callback(false, body);
      return;
    }
    var err = new Error(error);
    callback(err);
  })
};


exports.oauthTokenUrl = oauthTokenUrl;
exports.oauthTokenPath = oauthTokenPath;
exports.spotify_csrf_proxy = spotify_csrf_proxy;
