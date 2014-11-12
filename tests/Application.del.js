'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var express = require('../');
var request = require('./request');
var del = request.del;

describe('app.del()', function(){
    it('should alias app.delete()', function(done){
        var app = express();

        app.delete('/tobi', function( req, res ){
            res.end('deleted tobi!');
        });

        del(app, '/tobi', function( res ) {
            res.body.should.equal( 'deleted tobi!' );

            done();
        });
    });
});
