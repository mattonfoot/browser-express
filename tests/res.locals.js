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

describe('res', function(){
    describe('.locals', function(){
        it('should be empty by default', function( done ) {
            var app = expression();

            app.use(function( req, res ) {
                Object.keys( res.locals ).should.eql( [ ] );
                res.end();
            });

            get(app, '/', function( res ) {
                res.statusCode.should.equal( 200 );

                done();
            });
        });
    });

    it('should work when mounted', function( done ) {
        var app = expression();
        var blog = expression();

        app.use( blog );

        blog.use(function( req, res, next ) {
            res.locals.foo = 'bar';
            next();
        });

        app.use(function( req, res ) {
            res.locals.foo.should.equal('bar');
            res.end();
        });

        get(app, '/', function( res ) {
            res.statusCode.should.equal( 200 );

            done();
        });
    });
});
