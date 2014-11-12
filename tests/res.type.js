'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;

describe('res', function(){
    describe('.type(str)', function(){
        it('should set the Content-Type based on a filename', function(done){
            var app = expression();

            app.use(function(req, res){
                res.type('foo.js').end('var name = "tj";');
            });

            get(app, '/', function( res ) {
                res.get('Content-Type').should.match( /application\/javascript/ );

                done();
            });
        });

        it('should default to application/octet-stream', function(done){
            var app = expression();

            app.use(function(req, res){
                res.type('rawr').end('var name = "tj";');
            });

            get(app, '/', function( res ) {
                res.get('Content-Type').should.match( /application\/octet-stream/ );

                done();
            });
        });

        it('should set the Content-Type with type/subtype', function(done){
            var app = expression();

            app.use(function(req, res){
                res.type('application/vnd.amazon.ebook')
                  .end('var name = "tj";');
            });

            get(app, '/', function( res ) {
                res.get('Content-Type').should.match( /application\/vnd.amazon.ebook/ );

                done();
            });
        });
    });
});
