'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false*/
/*global it: false*/
/*global window: false*/

var expression = require('..');
var request = require('./request');
var get = request.get;

describe('middleware', function() {
    describe('.next()', function() {
        it('should behave like connect', function( done ) {
            var app = expression();
            var calls = [];

            app.use(function(req, res, next) {
                calls.push( 'one' );
                next();
            });

            app.use(function(req, res, next) {
                calls.push( 'two' );
                next();
            });

            app.use(function(req, res) {
                res.setHeader('Content-Type', 'application/json');

                res.end( req.body );
            });

            get(app, '/', { body:'{"foo":"bar"}' },function( res ) {
                res.statusCode.should.equal( 200 );
                res.text.should.equal( '{"foo":"bar"}' );

                should.exist( res.data.foo );
                res.data.foo.should.equal( 'bar' );

                done();
            });
        });
    });
});
