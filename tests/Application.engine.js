'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var express = require('../');
var request = require('./request');
var get = request.get;

function render( str, options, fn ) {
    str = str.replace( '{{user.name}}', options.user.name );

    fn( null, str );
}

describe('app', function(){
    describe('.engine(ext, fn)', function() {
        it('should map a template engine', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.engine('.html', render);
            app.locals.user = { name: 'tobi' };

            app.render('user.html', function(err, str){
                if ( err ) {
                    return done( err );
                }

                str.should.equal('<p>tobi</p>');

                done();
            });
        });

        it('should throw when the callback is missing', function(){
            var app = expression();

            function fixture(){
                app.engine( '.html', null );
            }

            fixture.should.throw( 'callback function required' );
        });

        it('should work without leading "."', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.engine('html', render);
            app.locals.user = { name: 'tobi' };

            app.render('user.html', function(err, str){
                if ( err ) {
                    return done( err );
                }

                str.should.equal('<p>tobi</p>');

                done();
            });
        });

        it('should work "view engine" setting', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.engine('html', render);
            app.set('view engine', 'html');
            app.locals.user = { name: 'tobi' };

            app.render('user', function(err, str){
                if (err) {
                    return done(err);
                }

                str.should.equal('<p>tobi</p>');

                done();
            });
        });

        it('should work "view engine" with leading "."', function(done){
            var app = expression();

            app.set('views', '/fixtures');
            app.engine('.html', render);
            app.set('view engine', '.html');
            app.locals.user = { name: 'tobi' };

            app.render('user', function(err, str){
                if (err) {
                    return done(err);
                }

                str.should.equal('<p>tobi</p>');

                done();
            });
        });
    });
});
