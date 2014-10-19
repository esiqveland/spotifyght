var nock = require('nock');
var supertest = require('supertest');
var should = require('chai').should();
var expect = require('chai').expect;

var csrf = require('../controllers/spotifycsrf.js');
var url = csrf.oauthTokenUrl;

var faketoken = { t: 'longfasteajklsfdhdjkaslhfjkdshajkfldhsaljfhadsjkl' }

var app = require('../app');

describe('csrftoken proxy', function() {
  before(function(next) {
    var fake = nock(csrf.oauthTokenUrl)
                .get(csrf.oauthTokenPath)
                .reply(200, faketoken)
                .log(console.log); // log calls
    next();
  });
  it('should return token when called', function(done) {
    supertest(app)
      .get('/spotifycsrf')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('t');
        expect(res.body.t).to.equal(faketoken.t);
        done();
      });
  });
});
