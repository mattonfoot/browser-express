'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var res = expression.response;

describe('res', function(){

    beforeEach(function() {
        res.removeHeader( 'link' );
    });

    // doubling in phantom js

    describe('.links(obj)', function(){
        it.skip('should set Link header field', function(){
              res.links({
                  next: 'http://api.example.com/users?page=2',
                  last: 'http://api.example.com/users?page=5'
              });

              res.get('link')
                  .should.equal(
                      '<http://api.example.com/users?page=2>; rel="next", ' +
                      '<http://api.example.com/users?page=5>; rel="last"');
        });

        it.skip('should set Link header field for multiple calls', function() {
            res.links({
                next: 'http://api.example.com/users?page=2',
                last: 'http://api.example.com/users?page=5'
            });

            res.links({
                prev: 'http://api.example.com/users?page=1'
            });

            res.get('link')
                .should.equal(
                    '<http://api.example.com/users?page=2>; rel="next", ' +
                    '<http://api.example.com/users?page=5>; rel="last", ' +
                    '<http://api.example.com/users?page=1>; rel="prev"');
        });
    });
});
