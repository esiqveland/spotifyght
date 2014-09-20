/**
 * CORS support.
 */

exports.setup = function (req, res, next) {
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Credentials', true);
  res.set('Access-Control-Allow-Origin', req.headers.origin);
  res.set('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Origin, Cookie, X-HTTP-Method-Override, Accept, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) {
    return res.send(200);
  }
  next();
};
