'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var res = expression.response;

describe('res', function(){
    describe('.get(field)', function() {
        it('should get the response header field', function(){
            res.setHeader('Content-Type', 'text/x-foo');

            res.get('Content-Type').should.equal('text/x-foo');
            res.get('Content-type').should.equal('text/x-foo');
            res.get('content-type').should.equal('text/x-foo');
        });
    });
});
