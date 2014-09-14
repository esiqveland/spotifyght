var api = require('../app');
var spotifyght_util = require('../util');

var GROUPS = spotifyght_util.GROUPS;
var TRACKS = spotifyght_util.TRACKS;

exports.getGroupInfo = function (req, res) {
  var db = req.db;
  db.get(GROUPS + req.params.id, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).end();
    }
    console.log(result);
    if (result) {
      res.send({result: result});
    }
    res.status(404).end();
  });

};

exports.deleteGroup = function (req, res) {
  var db = req.db;
  if(!req.params.id) {
    res.status(404).end();
  }
  db.DEL(GROUPS + req.params.id, function(err, result) {
    if(err) {
      throw err;
    }
    if(result > 0) {
      res.status(200).send('OK');
      return;
    }
    res.status(404).end();
  });

};

exports.createGroup = function (req, res) {
  console.log("body: ");
  console.log(req.body);
  if(!req.body || !req.body.secret || !req.body.secret) {
    res.status(400).end();
    return;
  }
  var db = req.db;

  db.hsetnx(GROUPS + req.params.id, 'secret', req.body.secret, function (err, result) {
    if (err) {
      console.log(err);
      res.status(400).end();
      throw err;
    }
    if (result === 0) {
      res.status(409).end();
      return;
    }
    res.status(201).end();
  });
};
