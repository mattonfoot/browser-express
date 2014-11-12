'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var res = expression.response;
var request = require('./request');
var get = request.get;

describe('res', function(){
    describe('.set(field, value)', function(){
        it('should set the response header field', function(done){
            var app = expression();

            app.use(function(req, res){
                res.set('Content-Type', 'text/x-foo; charset=utf-8').end();
            });

            get(app, '/', function( res ) {
                res.get('Content-Type').should.equal( 'text/x-foo; charset=utf-8' );

                done();
            });
        });

        it('should coerce to a string', function(){
              res.headers = {};
              res.set('X-Number', 123);
              res.get('X-Number').should.equal('123');
        });
    });

    describe('.set(field, values)', function(){
        it('should set multiple response header fields', function(done){
          var app = expression();

          app.use(function(req, res){
              res.set('Set-Cookie', ["type=ninja", "language=javascript"]);
              res.send(res.get('Set-Cookie'));
          });

          get(app, '/', function( res ) {
              res.text.should.equal( '["type=ninja","language=javascript"]' );

              done();
          });
        });

        it('should coerce to an array of strings', function(){
            res.headers = {};
            res.set('X-Numbers', [123, 456]);
            JSON.stringify(res.get('X-Numbers')).should.equal('["123","456"]');
        });

        it('should not set a charset of one is already set', function () {
            res.headers = {};
            res.set('Content-Type', 'text/html; charset=lol');
            res.get('content-type').should.equal('text/html; charset=lol');
        });
    });

    describe('.set(object)', function(){
        it('should set multiple fields', function(done){
            var app = expression();

            app.use(function(req, res){
              res.set({
                'X-Foo': 'bar',
                'X-Bar': 'baz'
              }).end();
            });

            get(app, '/', function( res ) {
                res.get('X-Foo').should.equal( 'bar' );
                res.get('X-Bar').should.equal( 'baz' );

                done();
            });
        });

        it('should coerce to a string', function(){
            res.headers = {};
            res.set({ 'X-Number': 123 });
            res.get('X-Number').should.equal('123');
        });
    });
});
