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

describe('app.route', function(){
    it('should return a new route', function(done){
        var app = expression();

        app.route('/foo')
            .get(function(req, res) {
              res.send('get');
            })
            .post(function(req, res) {
              res.send('post');
            });

        post(app, '/foo', function( res ) {
            res.body.should.equal( 'post' );

            done();
        });
    });

  it('should all .VERB after .all', function(done){
      var app = expression();

      app.route('/foo')
          .all(function(req, res, next) {
            next();
          })
          .get(function(req, res) {
            res.send('get');
          })
          .post(function(req, res) {
            res.send('post');
          });

      post(app, '/foo', function( res ) {
          res.body.should.equal( 'post' );

          done();
      });
  });

  it('should support dynamic routes', function(done){
    var app = expression();

    app.route('/:foo')
    .get(function(req, res) {
      res.send(req.params.foo);
    });

    get(app, '/test', function( res ) {
        res.body.should.equal( 'test' );

        done();
    });
  });

  it('should not error on empty routes', function(done){
    var app = expression();

    app.route('/:foo');

    get(app, '/test', function( res ) {
        res.statusCode.should.equal( 404 );

        done();
    });
  });
});
