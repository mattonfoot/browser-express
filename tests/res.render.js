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
    describe('.render(name)', function(){
        it('should support absolute paths', function(done){
            var app = expression();

            app.locals.user = { name: 'tobi' };

            app.use(function(req, res){
                res.render( '/fixtures/user.jade' );
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should support absolute paths with "view engine"', function(done){
            var app = expression();

            app.locals.user = { name: 'tobi' };
            app.set( 'view engine', 'jade' );

            app.use(function(req, res){
                res.render( '/fixtures/user' );
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should expose app.locals', function(done){
            var app = expression();

            app.set( 'views', '/fixtures' );
            app.locals.user = { name: 'tobi' };

            app.use(function(req, res){
                res.render( 'user.jade' );
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should expose app.locals with `name` property', function(done){
            var app = expression();

            app.set( 'views', '/fixtures' );
            app.locals.name = 'tobi';

            app.use(function(req, res){
                res.render( 'name.jade' );
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should support index.<engine>', function(done){
            var app = expression();

            app.set( 'views', '/fixtures' );
            app.set( 'view engine', 'jade' );

            app.use(function( req, res ){
              res.render( 'blog/post' );
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<h1>blog post</h1>' );

                done();
            });
        });

        describe('when an error occurs', function(){
            it('should next(err)', function(done){
                var app = expression();

                app.set('views', '/fixtures');

                app.use(function(req, res){
                    res.render( 'user.jade' );
                });

                app.use(function(err, req, res, next){
                    res.end( err.message );
                });

                get( app, '/', function( res ) {
                    try {
                      res.text.should.match( /Cannot read property '[^']+' of undefined/ );
                    } catch( err ) {

                        try {
                            res.text.should.match( /is not an object \(evaluating / ); // phantomjs error is different from jade
                        } catch( err ) {
                            return done( err );
                        }
                    }

                    done();
                });
            });
        });

        describe('when "view engine" is given', function(){
            it('should render the template', function(done){
                var app = expression();

                app.set('view engine', 'jade');
                app.set('views', '/fixtures');

                app.use(function(req, res){
                    res.render( 'email' );
                });

                get( app, '/', function( res ) {
                    res.text.should.equal( '<p>This is an email</p>' );

                    done();
                });
            });
        });

        describe('when "views" is given', function(){
            it('should lookup the file in the path', function(done){
                var app = expression();

                app.set('views', '/fixtures/default_layout');

                app.use(function(req, res){
                    res.render( 'user.jade', { user: { name: 'tobi' } });
                });

                get( app, '/', function( res ) {
                    res.text.should.equal( '<p>tobi</p>' );

                    done();
                });
            });

            describe('when array of paths', function(){
                it('should lookup the file in the path', function(done){
                    var app = expression();
                    var views = [ '/fixtures/local_layout', '/fixtures/default_layout' ];

                    app.set( 'views', views );

                    app.use(function(req, res){
                        res.render('user.jade', { user: { name: 'tobi' } });
                    });

                    get( app, '/', function( res ) {
                        res.text.should.equal( '<span>tobi</span>' );

                        done();
                    });
                });

                it('should lookup in later paths until found', function(done){
                    var app = expression();
                    var views = [ '/fixtures/local_layout', '/fixtures/default_layout' ];

                    app.set('views', views);

                    app.use(function(req, res){
                        res.render('name.jade', { name: 'tobi' });
                    });

                    get( app, '/', function( res ) {
                        res.text.should.equal( '<p>tobi</p>' );

                        done();
                    });
                })
            })
        });
    });

    describe('.render(name, option)', function(){
        it('should render the template', function(done){
            var app = expression();

            app.set('views', '/fixtures');

            var user = { name: 'tobi' };

            app.use(function(req, res){
              res.render('user.jade', { user: user });
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should expose app.locals', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.locals.user = { name: 'tobi' };

            app.use(function(req, res){
                res.render('user.jade');
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should expose res.locals', function(done){
            var app = expression();

            app.set('views', '/fixtures');

            app.use(function(req, res){
                res.locals.user = { name: 'tobi' };
                res.render('user.jade');
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>tobi</p>' );

                done();
            });
        });

        it('should give precedence to res.locals over app.locals', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.locals.user = { name: 'tobi' };

            app.use(function(req, res){
                res.locals.user = { name: 'jane' };
                res.render('user.jade', {});
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>jane</p>' );

                done();
            });
        });

        it('should give precedence to res.render() locals over res.locals', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            var jane = { name: 'jane' };

            app.use(function(req, res){
                res.locals.user = { name: 'tobi' };
                res.render('user.jade', { user: jane });
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>jane</p>' );

                done();
            });
        });

        it('should give precedence to res.render() locals over app.locals', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.locals.user = { name: 'tobi' };
            var jane = { name: 'jane' };

            app.use(function(req, res){
                res.render('user.jade', { user: jane });
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>jane</p>' );

                done();
            });
        });
    });

    describe('.render(name, options, fn)', function(){
        it('should pass the resulting string', function(done){
            var app = expression();

            app.set('views', '/fixtures');

            app.use(function(req, res){
                var tobi = { name: 'tobi' };

                res.render('user.jade', { user: tobi }, function(err, html){
                    html = html.replace('tobi', 'loki');
                    res.end(html);
                });
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>loki</p>' );

                done();
            });
        });
    });

    describe('.render(name, fn)', function(){
        it('should pass the resulting string', function(done){
            var app = expression();

            app.set('views', '/fixtures');

            app.use(function(req, res){
                res.locals.user = { name: 'tobi' };

                res.render('user.jade', function(err, html){
                    html = html.replace('tobi', 'loki');
                    res.end(html);
                });
            });

            get( app, '/', function( res ) {
                res.text.should.equal( '<p>loki</p>' );

                done();
            });
        });

        describe('when an error occurs', function(){
            it('should pass it to the callback', function(done){
                var app = expression();

                app.set('views', '/fixtures');

                app.use(function(req, res){
                  res.render('user.jade', function(err){
                    res.end(err.message);
                  });
                });

                get( app, '/', function( res ) {
                    try {
                      res.text.should.match( /Cannot read property '[^']+' of undefined/ );
                    } catch( err ) {

                        try {
                            res.text.should.match( /is not an object \(evaluating / ); // phantomjs error is different from jade
                        } catch( err ) {
                            return done( err );
                        }
                    }

                    done();
                });
            });
        });
    });
});
