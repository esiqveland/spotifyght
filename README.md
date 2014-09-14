# spotifyght
Spotify voting app backend.
Contains backend for collecting scores and votes and exposes these data as restful-ish json.

deps:
- redis:
 - install and run redis database:

```bash
brew install redis
redis-server /usr/local/etc/redis.conf
```
- node:
 - install node and npm, then run:
```bash
npm install 
```
to start server:
```bash
ENV=development ./server.sh
```
