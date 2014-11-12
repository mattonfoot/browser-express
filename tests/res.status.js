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
    describe('.status(code)', function(){
        it('should set the response .statusCode', function(done){
            var app = expression();

            app.use(function(req, res){
              res.status( 201 ).end('Created');
            });

            get(app, '/', function( res ) {
                res.statusCode.should.equal( 201 );
                res.text.should.equal( 'Created' );

                done();
            });
        })
    })
})
