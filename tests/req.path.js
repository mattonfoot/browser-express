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

describe('req', function() {
    describe('.path', function() {
        it('should return the parsed pathname', function( done ) {
            var app = expression();

            app.use(function( req, res ) {
                res.end(req.path);
            });

            get(app, '/login?redirect=/post/1/comments', function( res ) {
                res.body.should.equal( '/login' );

                done();
            });
        });
    });
});
