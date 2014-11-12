'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;

describe('Application', function(){
    it('should inherit from event emitter', function( done ) {
        var app = expression();

        app.on('foo', done);

        app.emit('foo');
    });

    it('should be callable', function() {
        var app = expression();

        app.should.be.a( 'function' );
    });

    it('should 404 without routes', function( done ) {
        var app = expression();

        get(app, '/', function( res ) {
            should.exist( res );
            res.should.haveOwnProperty( 'statusCode' );
            res.statusCode.should.equal( 404 );

            res.should.haveOwnProperty( 'body' );
            res.body.should.equal( 'Cannot GET /\n' );

            done();
        });
    });
});

describe('Application.parent', function(){
    it('should return the parent when mounted', function(){
        var app = expression();
        var blog = expression();
        var blogAdmin = expression();

        app.use( '/blog', blog );
        blog.use( '/admin', blogAdmin );

        should.not.exist( app.parent );

        should.exist( blog.parent );
        blog.parent.should.equal( app );

        should.exist( blogAdmin.parent );
        blogAdmin.parent.should.equal( blog );
    });
});

describe('Application.mountpath', function(){
    it('should return the mounted path', function(){
        var admin = expression();
        var app = expression();
        var blog = expression();
        var fallback = expression();

        app.use( '/blog', blog );
        app.use( fallback );
        blog.use( '/admin', admin );

        admin.mountpath.should.equal( '/admin' );
        app.mountpath.should.equal( '/' );
        blog.mountpath.should.equal( '/blog' );
        fallback.mountpath.should.equal( '/' );
    });
});

describe('Application.path()', function(){
    it('should return the canonical', function(){
        var app = expression();
        var blog = expression();
        var blogAdmin = expression();

        app.use('/blog', blog);
        blog.use('/admin', blogAdmin);

        app.path().should.equal('');
        blog.path().should.equal('/blog');
        blogAdmin.path().should.equal('/blog/admin');
    });
});
