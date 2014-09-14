module.exports = function(config) {
  var redis = require('redis');

  var db = redis.createClient(config.redis.port, config.redis.host, {});
  db.on("error", function (err) {
    console.log("DB: Error " + err);
  });
  return db;
};