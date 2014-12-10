
var config = {
    port: process.env.PORT || 3001,
    env: process.env.ENVIRONMENT  || 'development',
    redis: {
      //host: '10.0.1.100',
      host: 'redis',      
      port: 6379,
      password: process.env.REDIS_PASS || undefined
    }
};

if(config.redis.password) {
	console.log("Got a REDIS_PASS");
}

module.exports = config;
