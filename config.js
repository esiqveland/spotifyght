
var config = {
    port: process.env.PORT || 3001,
    env: process.env.ENVIRONMENT  || 'development',
    redis: {
      //host: '10.0.1.100',
      host: 'redis',
      port: 6379
    }
};

module.exports = config;
