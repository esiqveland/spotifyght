var supertest = require('supertest');
var should = require('chai').should();

var utils = require('./utils');

var config = require('../config');
var app = require('../app');

describe('ping', function () {
 it('should return pong given url /ping', function (done) {
   supertest(app)
      .get('/ping')
     .expect(200)
     .end(function (err, res) {
       should.not.exist(err);
       res.text.should.equal('pong');
       done();
     });
 });
});

describe('Not found', function () {
 it('should return 404 when accessing non existing route', function (done) {
   supertest(app)
     .get('/pingasdffdsa')
     .expect(404)
     .end(function (err, res) {
       should.not.exist(err);
       res.text.should.equal('Not Found');
       done();
     });
 });
});
