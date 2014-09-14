/**
 * CORS support.
 */


exports.setup = function (req, res, next) {
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', 'http://localhost:3000 *.spotilocal.com');
  res.set('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
};