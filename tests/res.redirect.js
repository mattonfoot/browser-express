'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;
var head = request.head;

describe('res', function(){
    describe('.redirect(url)', function(){
        it('should default to a 302 redirect', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect('http://google.com');
            });

            get(app, '/', function( res ) {
                res.statusCode.should.equal( 302 );
                res.headers.should.have.property('location', 'http://google.com');
                res.get('location').should.equal( 'http://google.com' );

                done();
            });
        });
    });

    describe('.redirect(status, url)', function(){
        it('should set the response status', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect( 303, 'http://google.com' );
            });

            get(app, '/', function( res ) {
                res.statusCode.should.equal( 303 );
                res.headers.should.have.property('location', 'http://google.com');
                res.get('location').should.equal( 'http://google.com' );

                done();
            });
        });
    });

    describe('when the request method is HEAD', function(){
        it('should ignore the body', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect( 'http://google.com' );
            });

            head(app, '/', function( res ) {
                res.headers.should.have.property('location', 'http://google.com');
                res.get('location').should.equal( 'http://google.com' );
                res.text.should.equal('');

                done();
            });
        });
    });

    describe('when accepting html', function(){
        it('should respond with html', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect('http://google.com');
            });

            get(app, '/', {
                'Accept': 'text/html'
            }, function( res ) {
                res.headers.should.have.property('location', 'http://google.com');
                res.text.should.equal('<p>Moved Temporarily. Redirecting to <a href="http://google.com">http://google.com</a></p>');

                done();
            });
        });

        it('should escape the url', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect('<lame>');
            });

            get(app, '/', {
                'Host': 'http://example.com',
                'Accept': 'text/html'
            }, function( res ) {
                res.text.should.equal('<p>Moved Temporarily. Redirecting to <a href="&lt;lame&gt;">&lt;lame&gt;</a></p>');

                done();
            });
        });

        it('should include the redirect type', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect(301, 'http://google.com');
            });

            get(app, '/', {
                'Host': 'http://example.com',
                'Accept': 'text/html'
            }, function( res ) {
                res.get('Content-Type').should.match( /html/ );
                res.get('Location').should.equal( 'http://google.com' );
                res.statusCode.should.equal( 301 );
                res.text.should.equal('<p>Moved Permanently. Redirecting to <a href="http://google.com">http://google.com</a></p>');

                done();
            });
        });

    });

    describe('when accepting text', function() {

        it('should respond with text', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect('http://google.com');
            });

            get(app, '/', {
                'Accept': 'text/plain, */*'
            }, function( res ) {
                  res.headers.should.have.property('location', 'http://google.com');
                  res.headers.should.have.property('content-length', '51');
                  res.text.should.equal('Moved Temporarily. Redirecting to http://google.com');

                done();
            });
        })

        it('should encode the url', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect('http://example.com/?param=<script>alert("hax");</script>');
            });

            get(app, '/', {
                'Host': 'http://example.com',
                'Accept': 'text/plain, */*'
            }, function( res ) {
                res.text.should.equal('Moved Temporarily. Redirecting to http://example.com/?param=%3Cscript%3Ealert(%22hax%22);%3C/script%3E');

                done();
            });
        })

        it('should include the redirect type', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect(301, 'http://google.com');
            });

            get(app, '/', {
                'Accept': 'text/plain, */*'
            }, function( res ) {
                res.headers.should.have.property('content-type');
                res.get('Content-Type').should.match( /plain/ );
                res.headers.should.have.property('location');
                res.get('Location').should.equal( 'http://google.com' );
                res.text.should.equal('Moved Permanently. Redirecting to http://google.com');

                done();
            });
        })

    });

    describe('when accepting neither text or html', function(){
        it('should respond with an empty body', function(done){
            var app = expression();

            app.use(function(req, res){
                res.redirect('http://google.com');
            });

            get(app, '/', {
                'Accept': 'application/octet-stream'
            }, function( res ) {
                res.headers.should.not.have.property( 'content-type' );
                res.get('Content-Length').should.equal( '0' );
                res.get('Location').should.equal( 'http://google.com' );
                res.statusCode.should.equal( 302 );

                done();
            });
        });
    });
});
