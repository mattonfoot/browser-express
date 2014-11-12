'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;

describe('req', function(){
  describe('.accepts(type)', function(){
    it('should return true when Accept is not present', function(done){
        var app = expression();

        app.use(function(req, res, next){
          res.end(req.accepts('json') ? 'yes' : 'no');
        });

        get(app, '/', function( res ) {
            res.text.should.equal( 'yes' );

            done();
        });
    });

    it('should return true when present', function(done){
        var app = expression();

        app.use(function(req, res, next){
          res.end(req.accepts('json') ? 'yes' : 'no');
        });

        get(app, '/', {
            'Accept': 'application/json'
        }, function( res ) {
            res.text.should.equal( 'yes' );

            done();
        });
    });

    it('should return false otherwise', function(done){
        var app = expression();

        app.use(function(req, res, next){
          res.end(req.accepts('json') ? 'yes' : 'no');
        });

        get(app, '/', {
            'Accept': 'text/html'
        }, function( res ) {
            res.text.should.equal( 'no' );

            done();
        });
    });
  });

  it('should accept an argument list of type names', function(done){
      var app = expression();

      app.use(function(req, res, next){
        res.end(req.accepts('json', 'html'));
      });

      get(app, '/', {
          'Accept': 'text/html'
      }, function( res ) {
          res.text.should.equal( 'html' );

          done();
      });
  });

  describe('.accepts(types)', function(){
    it('should return the first when Accept is not present', function(done){
      var app = expression();

      app.use(function(req, res, next){
        res.end(req.accepts(['json', 'html']));
      });

      get(app, '/', function( res ) {
          res.text.should.equal( 'json' );

          done();
      });
    });

    it('should return the first acceptable type', function(done){
      var app = expression();

      app.use(function(req, res, next){
        res.end(req.accepts(['json', 'html']));
      });

      get(app, '/', {
          'Accept': 'text/html'
      }, function( res ) {
          res.text.should.equal( 'html' );

          done();
      });
    });

    it('should return false when no match is made', function(done){
      var app = expression();

      app.use(function(req, res, next){
        res.end(req.accepts(['text/html', 'application/json']) ? 'yup' : 'nope');
      });

      get(app, '/', {
          'Accept': 'foo/bar, bar/baz'
      }, function( res ) {
          res.text.should.equal( 'nope' );

          done();
      });
    });

    it('should take quality into account', function(done){
      var app = expression();

      app.use(function(req, res, next){
        res.end(req.accepts(['text/html', 'application/json']));
      });

      get(app, '/', {
          'Accept': '*/html; q=.5, application/json'
      }, function( res ) {
          res.text.should.equal( 'application/json' );

          done();
      });
    });

    it('should return the first acceptable type with canonical mime types', function(done){
      var app = expression();

      app.use(function(req, res, next){
        res.end(req.accepts(['application/json', 'text/html']));
      });

      get(app, '/', {
          'Accept': '*/html'
      }, function( res ) {
          res.text.should.equal( 'text/html' );

          done();
      });
    })
  })
})
