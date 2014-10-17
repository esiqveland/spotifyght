module.exports = function(config) {
  var redis = require('redis');

  var db = redis.createClient(config.redis.port, config.redis.host, {});
  db.on("error", function (err) {
    console.error("DB: Error !");
    console.error(err);
  });
  return db;
};
