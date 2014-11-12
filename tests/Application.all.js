'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;
var put = request.put;
var del = request.del;

describe('app.all()', function(){
    it('should add a router per method', function(done){
        var app = expression();

        app.all('/tobi', function( req, res ){
            res.end(req.method);
        });

        put(app, '/tobi', function( res ) {
            res.statusCode.should.equal( 200 );
            res.body.should.equal( 'PUT' );

            get(app, '/tobi', function( res ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( 'GET' );

                done();
            });
        });
    });

    it('should ', function(done){
        var app = expression()
        var n = 0;

        app.all('/*', function(req, res, next){
            if (n++) return done(new Error('DELETE called several times'));
            next();
        });

        del(app, '/tobi', function( res ) {
            res.statusCode.should.equal( 404 );

            done();
        });
    });
});
