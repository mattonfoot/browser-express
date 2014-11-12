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
    describe('.query', function(){
        it('should default to {}', function(done){
            var app = createApp();

            get(app, '/', function( res ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( '{}' );

                done();
            });
        });

        it('should default to parse complex keys', function (done) {
            var app = createApp();

            get(app, '/?user[name]=tj', function( res ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( '{"user":{"name":"tj"}}' );

                done();
            });
        });

        describe('when "query parser" is extended', function () {
            it('should parse complex keys', function (done) {
                var app = createApp('extended');

                get(app, '/?user[name]=tj', function( res ) {
                    res.statusCode.should.equal( 200 );
                    res.body.should.equal( '{"user":{"name":"tj"}}' );

                    done();
                });
            });
        });

        describe('when "query parser" is simple', function () {
            it('should not parse complex keys', function (done) {
                var app = createApp('simple');

                get(app, '/?user[name]=tj', function( res ) {
                    res.statusCode.should.equal( 200 );
                    res.body.should.equal( '{"user[name]":"tj"}' );

                    done();
                });
            });
        });

        describe('when "query parser" is a function', function () {
            it('should parse using function', function (done) {
                var app = createApp(function (str) {
                    return {'length': (str || '').length};
                });

                get(app, '/?user[name]=tj', function( res ) {
                    res.statusCode.should.equal( 200 );
                    res.body.should.equal( '{"length":13}' );  // the search is not encoded as it is passed

                    done();
                });
            });
        });

        describe('when "query parser" disabled', function () {
            it('should not parse query', function (done) {
                var app = createApp(false);

                get(app, '/?user[name]=tj', function( res ) {
                    res.statusCode.should.equal( 200 );
                    res.body.should.equal( '{}' );

                    done();
                });
            });
        });

        describe('when "query parser" disabled', function () {
            it('should not parse complex keys', function (done) {
                var app = createApp(true);

                get(app, '/?user[name]=tj', function( res ) {
                    res.statusCode.should.equal( 200 );
                    res.body.should.equal( '{"user[name]":"tj"}' );

                    done();
                });
            });
        });

        describe('when "query parser" an unknown value', function () {
            it('should throw', function () {
                function fixture() {
                    createApp( 'bogus' );
                }

                fixture.should.throw(/unknown value.*query parser/);
            });
        });
    });
});

function createApp( setting ) {
    var app = expression();

    if ( setting !== undefined ) {
        app.set( 'query parser', setting );
    }

    app.use(function (req, res) {
        res.send( req.query );
    });

    return app;
}
