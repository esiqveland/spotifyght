var Session = require('supertest-session')({
  app: require('../app'),
  envs: {
          ENVIRONMENT: 'test',
          SESSION_SECRET: 'RABL'
        }
});

var should = require('chai').should();
var expect = require('chai').expect;

var utils = require('./testutils');

var helpers = require('../util');
var config = require('../config');
var app = require('../app');

var testGroup = 'testGroupVote';
var testUri = 'spotify:track:3qP2sZfzZRqdBmLzDi8O2O';
var shortUri = '3qP2sZfzZRqdBmLzDi8O2O';

var baseUrl = '/group/'+testGroup;

describe('Voting on added tracks', function () {

  before(function(next) {
      this.sess = new Session();
      next();
  });
  after(function () {
    this.sess.destroy();
  });

  before(function(next) {
    this.sess
      .post('/login')
      .send({ username: 'testuser' })
        .expect(201)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.be.empty;
          next();
        });
  });

  before(function (next) {
    this.sess
      .post(baseUrl+'/tracks')
      .send({ uri: testUri })
        .expect(201)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.be.empty;
          next();
        });
  });

  it('should have 1 votes', function (done) {
    this.sess
      .get(baseUrl+'/'+shortUri+'/vote')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          expect(res.body.score).to.equal(1);
          done();
        });
  });

  it('a vote should have properties uri and score', function (done) {
    this.sess
      .get(baseUrl+'/'+shortUri+'/vote')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.body.should.have.property('uri');
          res.body.should.have.property('score');
          done();
        });
  });

  it('should have a full uri', function (done) {
    this.sess
      .get(baseUrl+'/'+shortUri+'/vote')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          expect(res.body.uri).to.equal(testUri);
          done();
        });
  });

  it('a vote should increase score by 1', function (done) {
    this.sess
      .post(baseUrl+'/'+shortUri+'/vote')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          expect(res.body.score).to.equal(2);
          done();
        });
  });

});

describe('Voting twice removes the vote', function () {

  before(function(next) {
    this.sess = new Session();
    next();
  });

  before(function(next) {
    this.sess
      .post('/login')
      .send({ username: 'anotheruser' })
        .expect(201)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.be.empty;
          next();
        });
  });

  after(function () {
    this.sess.destroy();
  });

  it('should reset vote on a double vote', function (done) {
    var sess = this.sess;
      sess
      .post(baseUrl+'/'+shortUri+'/vote')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          expect(res.body.score).to.equal(3);

          // vote again!
          sess
            .post(baseUrl+'/'+shortUri+'/vote')
              .expect(200)
              .end(function (err, res) {
                should.not.exist(err);
                expect(res.body.score).to.equal(2);
                done();
            });
        });
  });

});
