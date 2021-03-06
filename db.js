module.exports = function(config) {

  if(config.env === 'test') {
    var redis = require('fakeredis');
  } else {
    var redis = require('redis');
  }

  var db = redis.createClient(config.redis.port, config.redis.host, { auth_pass: config.redis.password });

  db.on("error", function (err) {
    console.error("DB: Error:", err);
  });

  return db;
};
