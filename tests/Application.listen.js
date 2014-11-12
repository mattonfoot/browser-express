'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');

describe('app.listen()', function(){
    it.skip('should wrap with an Navigation server', function( done ) {
        var app = expression(), server;

        app.delete('/tobi', function( req, res ) {
            res.end('deleted tobi!');
        });

        var server = app.listen(function() {
            server.stop();

            done();
        });
    });
});
