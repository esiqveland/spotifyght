# spotifyght
[![wercker status](https://app.wercker.com/status/76d45d7b1af65648284b0dd666e2f631/m "wercker status")](https://app.wercker.com/project/bykey/76d45d7b1af65648284b0dd666e2f631)

Spotify voting app backend.
Contains backend for collecting scores and votes and exposes these data as restful-ish json.

deps:
- redis:
 - install and run redis database:
```bash
brew install redis
redis-server /usr/local/etc/redis.conf
```
To install dependencies:
```bash
npm install
```
Running tests:
```bash
npm test
```

to start server:
```bash
./dev.sh
```
See config.js for configuration.
