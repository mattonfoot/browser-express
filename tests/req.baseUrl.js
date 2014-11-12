'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var expression = require('../');
var request = require('./request');
var get = request.get;

describe('req', function(){
    describe('.baseUrl', function(){
        it('should be empty for top-level route', function(done){
            var app = expression()

            app.get('/:a', function(req, res){
              res.end(req.baseUrl)
            });

            get(app, '/foo', function( res, req ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( '' );

                done();
            });
        });

        it('should contain lower path', function(done){
            var app = expression();
            var sub = expression.Router();

            sub.get('/:b', function(req, res) {
                res.end(req.baseUrl);
            });

            app.use('/:a', sub);

            get(app, '/foo/bar', function( res, req ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( '/foo' );

                done();
            });
        });

        it('should contain full lower path', function(done){
            var app = expression();
            var sub1 = expression.Router();
            var sub2 = expression.Router();
            var sub3 = expression.Router();

            sub3.get('/:d', function(req, res) {
                res.end(req.baseUrl);
            });
            sub2.use('/:c', sub3);
            sub1.use('/:b', sub2);
            app.use('/:a', sub1);

            get(app, '/foo/bar/baz/zed', function( res, req ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( '/foo/bar/baz' );

                done();
            });
        });

        it('should travel through routers correctly', function(done){
            var urls = [];
            var app = expression();
            var sub1 = expression.Router();
            var sub2 = expression.Router();
            var sub3 = expression.Router();

            sub3.get('/:d', function(req, res, next) {
                urls.push('0@' + req.baseUrl);
                next();
            });
            sub2.use('/:c', sub3);
            sub1.use('/', function(req, res, next) {
                urls.push('1@' + req.baseUrl);
                next();
            });
            sub1.use('/bar', sub2);
            sub1.use('/bar', function(req, res, next) {
                urls.push('2@' + req.baseUrl);
                next();
            });
            app.use(function(req, res, next) {
                urls.push('3@' + req.baseUrl);
                next();
            });
            app.use('/:a', sub1);
            app.use(function(req, res, next) {
                urls.push('4@' + req.baseUrl);
                res.end(urls.join(','));
            });

            get(app, '/foo/bar/baz/zed', function( res, req ) {
                res.statusCode.should.equal( 200 );
                res.body.should.equal( '3@,1@/foo,0@/foo/bar/baz,2@/foo/bar,4@' );

                done();
            });
        });
    });
});
