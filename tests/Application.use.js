'use strict';

var chai = require('chai');
chai.should();

/*global describe: false*/
/*global it: false*/
/*global window: false*/

var after = require('after');
var expression = require('..');
var request = require('./request');
var get = request.get;
var post = request.post;
var options = request.options;

describe('Application', function(){
    it('should emit "mount" when mounted', function( done ) {
        var blog = expression();
        var app = expression();

        blog.on( 'mount', function( arg ) {
            arg.should.equal( app );

            done();
        });

        app.use( blog );
    });

    describe('.use(Application)', function(){

        it('should mount the app', function( done ) {
              var blog = expression();
              var app = expression();

              blog.get('/blog', function( req, res ) {
                  res.end( 'blog' );
              });

              app.use( blog );

              get(app, '/blog', function( res ) {
                  res.body.should.equal( 'blog' );

                  done();
              });
        });

        it('should support mount-points', function(done){
              var blog = expression();
              var forum = expression();
              var app = expression();

              blog.get('/', function(req, res) {
                  res.end( 'blog' );
              });

              forum.get('/', function(req, res) {
                  res.end( 'forum' );
              });

              app.use( '/blog', blog );
              app.use( '/forum', forum );

              get(app, '/blog', function( res ) {
                  res.body.should.equal( 'blog' );

                  get( app, '/forum', function( res ) {
                      res.body.should.equal( 'forum' );
                      done();
                  });
              });
        });

        it('should set the child\'s .parent', function(){
            var blog = expression();
            var app = expression();

            app.use( '/blog', blog );

            blog.parent.should.equal( app );
        });

        it('should support dynamic routes', function(done){
            var blog = expression();
            var app = expression();

            blog.get('/', function( req, res ) {
                res.end( 'success' );
            });

            app.use( '/post/:article', blog );

            get(app, '/post/once-upon-a-time', function( res ) {
                res.body.should.equal( 'success' );

                done();
            });
        });

      it('should support mounted app anywhere', function(done){
          var cb = after(3, done);
          var blog = expression();
          var other = expression();
          var app = expression();

          function fn1(req, res, next) {
              res.setHeader('x-fn-1', 'hit');
              next();
          }

          function fn2(req, res, next) {
              res.setHeader('x-fn-2', 'hit');
              next();
          }

          blog.get('/', function(req, res){
              res.end('success');
          });

          blog.once('mount', function (parent) {
              parent.should.equal(app);
              cb();
          });

          other.once('mount', function (parent) {
              parent.should.equal(app);
              cb();
          });

          app.use( '/post/:article', fn1, other, fn2, blog );

          get(app, '/post/once-upon-a-time', function( res ) {
              res.get('x-fn-1').should.equal( 'hit' );
              res.get('x-fn-2').should.equal( 'hit' );

              res.body.should.equal( 'success' );

              cb();
          });
      });
  });

  describe('.use(middleware)', function(){

    it('should accept multiple arguments', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      app.use(fn1, fn2, function fn3(req, res) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      });

      get(app, '/', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should invoke middleware for all requests', function (done) {
      var app = expression();
      var cb = after(3, done);

      app.use(function (req, res) {
          res.send('saw ' + req.method + ' ' + req.url);
      });

      get(app, '/', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET /' );

          cb();
      });

      options(app, '/', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw OPTIONS /' );

          cb();
      });

      post(app, '/foo', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw POST /foo' );

          cb();
      });
    });

    it('should accept array of middleware', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      }

      app.use([ fn1, fn2, fn3 ]);

      get(app, '/', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should accept multiple arrays of middleware', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      }

      app.use([ fn1, fn2 ], [ fn3 ]);

      get(app, '/', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should accept nested arrays of middleware', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      }

      app.use([ [ fn1 ], fn2 ], [ fn3 ]);

      get(app, '/', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

  });

  describe('.use(path, middleware)', function(){
    it('should reject missing functions', function () {
      var app = expression();

      function fixture() {
          app.use( '/' );
      }

      fixture.should.throw(/requires middleware function/);
    });

    it('should reject non-functions as middleware', function () {
      var app = expression();

      function fixture1() {
          app.use( '/', 'hi' );
      }
      fixture1.should.throw(/requires middleware function.*string/);

      function fixture2() {
          app.use( '/', 5 );
      }
      fixture2.should.throw(/requires middleware function.*number/);

      function fixture3() {
          app.use( '/', null );
      }
      fixture3.should.throw(/requires middleware function.*Null/);

      function fixture4() {
          app.use( '/', new Date() );
      }
      fixture4.should.throw(/requires middleware function.*Date/);
    });

    it('should strip path from req.url', function (done) {
      var app = expression();

      app.use('/foo', function (req, res) {
        res.send('saw ' + req.method + ' ' + req.url);
      });

      get(app, '/foo/bar', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET /bar' );

          done();
      });
    });

    it('should accept multiple arguments', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      app.use('/foo', fn1, fn2, function fn3(req, res) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      });

      get(app, '/foo', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should invoke middleware for all requests starting with path', function (done) {
      var app = expression();
      var cb = after(3, done);

      app.use('/foo', function (req, res) {
        res.send('saw ' + req.method + ' ' + req.url);
      });

      get(app, '/', function( res ) {
          res.statusCode.should.equal( 404 );

          cb();
      });

      post(app, '/foo', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw POST /' );

          cb();
      });

      post(app, '/foo/bar', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw POST /bar' );

          cb();
      });
    });

    it('should work if path has trailing slash', function (done) {
      var app = expression();
      var cb = after(3, done);

      app.use('/foo/', function (req, res) {
        res.send('saw ' + req.method + ' ' + req.url);
      });

      get(app, '/', function( res ) {
          res.statusCode.should.equal( 404 );

          cb();
      });

      post(app, '/foo', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw POST /' );

          cb();
      });

      post(app, '/foo/bar', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw POST /bar' );

          cb();
      });
    });

    it('should accept array of middleware', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      }

      app.use('/foo', [ fn1, fn2, fn3 ]);

      get(app, '/foo', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should accept multiple arrays of middleware', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      }

      app.use('/foo', [ fn1, fn2 ], [ fn3 ]);

      get(app, '/foo', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should accept nested arrays of middleware', function (done) {
      var app = expression();

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.end();
      }

      app.use('/foo', [ fn1, [ fn2 ] ], [ fn3 ]);

      get(app, '/foo', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );

          done();
      });
    });

    it('should support array of paths', function (done) {
      var app = expression();
      var cb = after(3, done);

      app.use([ '/foo/', '/bar' ], function (req, res) {
        res.send('saw ' + req.method + ' ' + req.url + ' through ' + req.originalUrl);
      });

      get(app, '/', function( res ) {
          res.statusCode.should.equal( 404 );

          cb();
      });

      get(app, '/foo', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET / through /foo' );

          cb();
      });

      get(app, '/bar', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET / through /bar' );

          cb();
      });
    });

    it('should support array of paths with middleware array', function (done) {
      var app = expression();
      var cb = after(2, done);

      function fn1(req, res, next) {
        res.setHeader('x-fn-1', 'hit');
        next();
      }

      function fn2(req, res, next) {
        res.setHeader('x-fn-2', 'hit');
        next();
      }

      function fn3(req, res, next) {
        res.setHeader('x-fn-3', 'hit');
        res.send('saw ' + req.method + ' ' + req.url + ' through ' + req.originalUrl);
      }

      app.use([ '/foo/', '/bar' ], [ [ fn1 ], fn2 ], [ fn3 ]);

      get(app, '/foo', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET / through /foo' );

          cb();
      });

      get(app, '/bar', function( res ) {
          res.get('x-fn-1').should.equal( 'hit' );
          res.get('x-fn-2').should.equal( 'hit' );
          res.get('x-fn-3').should.equal( 'hit' );

          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET / through /bar' );

          cb();
      });
    });

    it('should support regexp path', function (done) {
      var app = expression();
      var cb = after(4, done);

      app.use(/^\/[a-z]oo/, function (req, res) {
        res.send('saw ' + req.method + ' ' + req.url + ' through ' + req.originalUrl);
      });

      get(app, '/', function( res ) {
          res.statusCode.should.equal( 404 );

          cb();
      });

      get(app, '/foo', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET / through /foo' );

          cb();
      });

      get(app, '/zoo/bear', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET /bear through /zoo/bear' );

          cb();
      });

      get(app, '/get/zoo', function( res ) {
          res.statusCode.should.equal( 404 );

          cb();
      });
    });

    it('should support empty string path', function (done) {
      var app = expression();

      app.use('', function (req, res) {
        res.send('saw ' + req.method + ' ' + req.url + ' through ' + req.originalUrl);
      });

      get(app, '/', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'saw GET / through /' );

          done();
      });
    });

  });

});
