var request = require('request');

var oauthTokenUrl = 'https://open.spotify.com';
var oauthTokenPath = '/token';

exports.oauthTokenUrl = oauthTokenUrl;
exports.oauthTokenPath = oauthTokenPath;

var getToken = function(callback) {
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

exports.spotify_csrf_proxy = function(req, res, next) {
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
