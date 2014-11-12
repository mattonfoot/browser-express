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
    describe('.protocol', function(){
        it('should return the protocol string', function(done){
            var app = expression();

            app.use(function(req, res){
                res.end(req.protocol);
            });

            get(app, '/', function( res ) {
                res.protocol.should.be( 'http' );
            });
        });
/*
        describe('when "trust proxy" is enabled', function(){
            it('should respect X-Forwarded-Proto', function(done){
                var app = express();

                app.enable('trust proxy');

                app.use(function(req, res){
                  res.end(req.protocol);
                });

                request(app)
                .get('/')
                .set('X-Forwarded-Proto', 'https')
                .expect('https', done);
            });

            it('should default to the socket addr if X-Forwarded-Proto not present', function(done){
                var app = express();

                app.enable('trust proxy');

                app.use(function(req, res){
                  req.connection.encrypted = true;
                  res.end(req.protocol);
                });

                request(app)
                .get('/')
                .expect('https', done);
            });

            it('should ignore X-Forwarded-Proto if socket addr not trusted', function(done){
                var app = express();

                app.set('trust proxy', '10.0.0.1');

                app.use(function(req, res){
                  res.end(req.protocol);
                });

                request(app)
                .get('/')
                .set('X-Forwarded-Proto', 'https')
                .expect('http', done);
            });

            it('should default to http', function(done){
                var app = express();

                app.enable('trust proxy');

                app.use(function(req, res){
                  res.end(req.protocol);
                });

                request(app)
                .get('/')
                .expect('http', done);
            });
        });

        describe('when "trust proxy" is disabled', function(){
            it('should ignore X-Forwarded-Proto', function(done){
                var app = express();

                app.use(function(req, res){
                  res.end(req.protocol);
                });

                request(app)
                .get('/')
                .set('X-Forwarded-Proto', 'https')
                .expect('http', done);
            });
        });
    */
    });
});
