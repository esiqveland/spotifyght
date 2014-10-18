var supertest = require('supertest');
var should = require('chai').should();

var utils = require('./utils');

var config = require('../config');
var app = require('../app');

var testGroup = 'testGroup';
var testUri = 'spotify:track:3ViMAvyCcmbRauKuoP2GJm';

describe('add and get a track', function () {

  it('should add a track to a group', function (done) {
    supertest(app)
      .post('/group/'+testGroup+'/tracks')
      .send({ uri: testUri })
        .expect(201)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.be.empty;
          done();
        });
  });

  it('should return added track from a group', function (done) {
    supertest(app)
      .get('/group/'+testGroup+'/tracks')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.contain(testUri);
          done();
        });
  });

  it('should index tracks', function (done) {
    supertest(app)
      .get('/group/'+testGroup+'/tracks')
        .expect(200, done);
  });

});
