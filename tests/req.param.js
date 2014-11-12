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
    describe('.param(name, default)', function() {
        it('should use the default value unless defined', function(done) {
            var app = expression();

            app.use(function(req, res) {
                res.end(req.param('name', 'tj'));
            });

            get(app, '/', function( res ) {
                res.body.should.equal( 'tj' );

                done();
            });
        });
    });

    describe('.param(name)', function() {
        it('should check req.query', function(done) {
            var app = expression();

            app.use(function(req, res) {
                res.end(req.param('name'));
            });

            get(app, '/?name=tj', function( res ) {
                res.body.should.equal( 'tj' );

                done();
            });
        });

        it('should check req.body', function(done) {
            var app = expression();

            app.use(function(req, res) {
                res.end(req.param('name'));
            });

            get(app, '/', {
                body: { name: 'tj' }
            }, function( res ) {
                res.body.should.equal( 'tj' );

                done();
            });
        });

        it('should check req.params', function(done) {
            var app = expression();

            app.get('/user/:name', function(req, res) {
                res.end(req.param('filter') + req.param('name'));
            });

            get(app, '/user/tj', function( res ) {
                res.body.should.equal( 'undefinedtj' );

                done();
            });
        });
    });
});
