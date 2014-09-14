/**
 * CORS support.
 */

// use "*" here to accept any origin
var Allow_Origin = '*';

exports.setup = function (req, res, next) {
  if (!req.get('Origin')) return next();
  res.set('Access-Control-Allow-Origin', Allow_Origin);
  res.set('Access-Control-Allow-Methods', 'GET PUT POST DELETE');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) {
    return res.send(200);
  }
  next();
};
