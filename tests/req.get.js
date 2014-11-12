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
    describe('.get(field)', function(){
        it('should return the header field value', function(done) {
            var app = expression();

            app.use(function( req, res ) {
                should.not.exist( req.get('Something-Else') );

                res.end( req.get('Content-Type') );
            });

            post(app, '/', {
                'Content-Type': 'application/json'
            }, function( res ) {
                res.body.should.equal( 'application/json' );

                done();
            });
        });

        it('should special-case Referer', function(done) {
            var app = expression();

            app.use(function(req, res) {
                var referer = req.get('Referer');

                res.end( referer );
            });

            post(app, '/', {
                'Referer': 'http://foobar.com'
            }, function( res ) {
                res.body.should.equal( 'http://foobar.com' );

                done();
            });
        });
    });
});
