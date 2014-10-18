var should = require('chai').should();
var expect = require('chai').expect;

var utils = require('./testutils');

var helpers = require('../util');
var config = require('../config');

var Session = require('supertest-session')({
  app: require('../app'),
  envs: {
          ENVIRONMENT: 'test',
          SESSION_SECRET: 'RABL'
        }
});


describe('login a user', function () {

  before(function(next) {
      this.sess = new Session();
      next();
  });
  after(function () {
    this.sess.destroy();
  });

  it('should let a user set a username', function (done) {
    this.sess
      .post('/login')
      .send({ username: 'testuser' })
        .expect(201)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.be.empty;
          done();
        });
  });

  it('should return username of logged in user', function (done) {
    this.sess
      .get('/login')
        .expect(200)
        .end(function (err, res) {
          should.not.exist(err);
          res.text.should.not.be.empty;
          console.log(res.resbody);
          expect(res.body.username).to.equal('testuser');
          done();
        });
  });

});
