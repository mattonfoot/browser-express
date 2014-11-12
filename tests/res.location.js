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

describe('res', function(){
    describe('.location(url)', function(){
        it('should set the header', function(done){
            var app = expression();

            app.use(function(req, res){
                res.location('http://google.com').end();
            });

            get(app, '/', function( res ) {
                res.headers.should.have.property('location', 'http://google.com');

                done();
            });
        });
    });
});
