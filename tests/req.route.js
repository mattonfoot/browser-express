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
    describe('.route', function(){
        it('should be the executed Route', function(done){
            var app = expression();

            app.get('/user/:id/:op?', function(req, res, next){
                req.route.path.should.equal('/user/:id/:op?');
                next();
            });

            app.get('/user/:id/edit', function(req, res){
                req.route.path.should.equal('/user/:id/edit');
                res.end();
            });

            get(app, '/user/12/edit', function( res ) {
                res.statusCode.should.equal( 200 );
                
                done();
            });
        });
    });
});
