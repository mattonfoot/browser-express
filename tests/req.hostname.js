'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;
var post = request.post;

describe('req', function(){
    describe('.hostname', function(){
        it('should return the Host when present', function(done) {
            var app = expression();

            app.use(function(req, res) {
                res.end(req.hostname);
            });

            post(app, '/', {
                'Host': 'example.com'
            }, function( res ) {
                res.body.should.equal( 'example.com' );

                done();
            });
        });

        it('should strip port number', function(done){
            var app = expression();

            app.use(function(req, res) {
                res.end(req.hostname);
            });

            post(app, '/', {
                'Host': 'example.com:3000'
            }, function( res ) {
                res.body.should.equal( 'example.com' );

                done();
            });
        });

        it('should return undefined otherwise', function(done){
            var app = expression();

            app.use(function(req, res) {
                res.end(String(req.hostname));
            });

            post(app, '/', {
                'Host': null
            }, function( res ) {
                res.body.should.equal( 'undefined' );

                done();
            });
        });

        it.skip('should work with IPv6 Host', function(done){
          var app = expression();

          app.use(function(req, res) {
              res.end(req.hostname);
          });

          post(app, '/', {
              'Host': '[::1]'
          }, function( res ) {
              res.body.should.equal( '[::1]' );

              done();
          });
        });

        it.skip('should work with IPv6 Host and port', function(done){
            var app = expression();

            app.use(function(req, res) {
                res.end(req.hostname);
            });

            post(app, '/', {
                'Host': '[::1]:3000'
            }, function( res ) {
                res.body.should.equal( '[::1]' );

                done();
            });
        });

        describe.skip('when "trust proxy" is enabled', function(){
              it('should respect X-Forwarded-Host', function(done){
                  var app = expression();

                  app.enable('trust proxy');

                  app.use(function(req, res) {
                      res.end(req.hostname);
                  });

                  get(app, '/', {
                      'Host': 'localhost',
                      'X-Forwarded-Host': 'example.com'
                  }, function( res ) {
                      res.body.should.equal( 'example.com' );

                      done();
                  });
              });

              it('should ignore X-Forwarded-Host if socket addr not trusted', function(done){
                  var app = expression();

                  app.set('trust proxy', '10.0.0.1');

                  app.use(function(req, res) {
                      res.end(req.hostname);
                  });

                  get(app, '/', {
                      'Host': 'localhost',
                      'X-Forwarded-Host': 'example.com'
                  }, function( res ) {
                      res.body.should.equal( 'localhost' );

                      done();
                  });
              });

              it('should default to Host', function(done){
                  var app = expression();

                  app.enable('trust proxy');

                  app.use(function(req, res) {
                      res.end(req.hostname);
                  });

                  get(app, '/', {
                      'Host': 'example.com'
                  }, function( res ) {
                      res.body.should.equal( 'example.com' );

                      done();
                  });
              });
        });

        describe('when "trust proxy" is disabled', function(){
            it('should ignore X-Forwarded-Host', function(done){
                var app = expression();

                app.use(function(req, res) {
                    res.end(req.hostname);
                });

                get(app, '/', {
                    'Host': 'localhost',
                    'X-Forwarded-Host': 'evil'
                }, function( res ) {
                    res.body.should.equal( 'localhost' );

                    done();
                });
            });
        });
    });
});
