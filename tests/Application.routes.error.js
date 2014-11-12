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

describe('app', function(){
    describe('.VERB()', function(){
        it('should only call an error handling routing callback when an error is propagated', function(done){
            var app = expression();

            var a = false;
            var b = false;
            var c = false;
            var d = false;

            app.get('/', function(req, res, next){
              next(new Error('fabricated error'));
            }, function(req, res, next) {
              a = true;
              next();
            }, function(err, req, res, next){
              b = true;
              err.message.should.equal('fabricated error');
              next(err);
            }, function(err, req, res, next){
              c = true;
              err.message.should.equal('fabricated error');
              next();
            }, function(err, req, res, next){
              d = true;
              next();
            }, function(req, res){
              a.should.be.false;
              b.should.be.true;
              c.should.be.true;
              d.should.be.false;
              res.status(204).send();
            });

            get(app, '/', function( res ) {
                res.statusCode.should.equal( 204 );

                done();
            });
        })
    })
})
