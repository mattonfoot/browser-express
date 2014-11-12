'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var after = require('after');
var expression = require('../');
var request = require('./request');
var get = request.get;
var del = request.del;
var post = request.post;
var methods = require('../lib/methods');

describe('app.router', function(){
    it('should restore req.params after leaving router', function(done){
        var app = expression();
        var router = new expression.Router();

        function handler1(req, res, next){
          res.setHeader('x-user-id', req.params.id);
          next()
        }

        function handler2(req, res){
          res.send(req.params.id);
        }

        router.use(function(req, res, next){
          res.setHeader('x-router', req.params.id);
          next();
        });

        app.get('/user/:id', handler1, router, handler2);

        get(app, '/user/1', function( res ) {
            should.not.exist( res.get('x-router') );
            res.get('x-user-id').should.equal( '1' );

            done();
        });
    });

  describe('methods', function(){
      methods.forEach(function( method ) {
          if ( method === 'connect' ) {
              return;
          }

          it('should include ' + method.toUpperCase(), function( done ) {
              var app = expression();
              var calls = [];

              app[ method ]('/foo', function( req, res ) {
                  if ( 'head' == method ) {
                      res.end();
                  } else {
                      res.end( method );
                  }
              });

              request( method, app, '/foo', function( res ) {
                  res.body.should.equal( 'head' == method ? '' : method );

                  done();
              });
          })

          it('should reject numbers for app.' + method, function() {
              var app = expression();

              function fixture() {
                  app[method]( '/', 3 );
              }

              fixture.should.throw(/Number/);
          })
      });

      it('should re-route when method is altered', function (done) {
          var app = expression();
          var cb = after(3, done);

          app.use(function (req, res, next) {
            if (req.method !== 'POST') return next();
            req.method = 'DELETE';
            res.setHeader('X-Method-Altered', '1');
            next();
          });

          app.delete('/', function (req, res) {
            res.end('deleted everything');
          });

          get(app, '/', function( res ) {
              res.statusCode.should.equal( 404 );
              res.body.should.equal( 'Cannot GET /\n' );

              cb();
          });

          del(app, '/', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( 'deleted everything' );

              cb();
          });

          post(app, '/', function( res ) {
              res.get('X-Method-Altered').should.equal( '1' );
              res.statusCode.should.equal( 200 );
              res.body.should.equal( 'deleted everything' );

              cb();
          });
      });
  })

  describe('decode querystring', function(){
      it('should decode correct params', function(done){
          var app = expression();

          app.get('/:name', function(req, res, next){
            res.send(req.params.name);
          });

          get(app, '/foo%2Fbar', function( res ) {
              res.body.should.equal( 'foo/bar' );

              done();
          });
      });

      it('should not accept params in malformed paths', function(done) {
          var app = expression();

          app.get('/:name', function(req, res, next){
            res.send(req.params.name);
          });

          get(app, '/%foobar', function( res ) {
              res.statusCode.should.equal( 400 );

              done();
          });
      });

      it('should not decode spaces', function(done) {
          var app = expression();

          app.get('/:name', function(req, res, next){
            res.send(req.params.name);
          });

          get(app, '/foo+bar', function( res ) {
              res.body.should.equal( 'foo+bar' );

              done();
          });
      });

      it('should work with unicode', function(done) {
          var app = expression();

          app.get('/:name', function(req, res, next){
            res.send(req.params.name);
          });

          get(app, '/%ce%b1', function( res ) {
              res.body.should.equal( '\u03b1' );

              done();
          });
      });
  });

  it('should be .use()able', function(done){
      var app = expression();

      var calls = [];

      app.use(function(req, res, next){
          calls.push('before');
          next();
      });

      app.get('/', function(req, res, next){
          calls.push('GET /')
          next();
      });

      app.use(function(req, res, next){
          calls.push('after');
          res.end();
      });

      get(app, '/', function( res ) {
          calls.should.eql([ 'before', 'GET /', 'after' ]);

          done();
      });
  });

  describe('when given a regexp', function(){
    it('should match the pathname only', function(done){
      var app = expression();

      app.get(/^\/user\/[0-9]+$/, function(req, res){
        res.end('user');
      });

      get(app, '/user/12?foo=bar', function( res ) {
          res.body.should.equal( 'user' );

          done();
      });
    })

    it('should populate req.params with the captures', function(done){
      var app = expression();

      app.get(/^\/user\/([0-9]+)\/(view|edit)?$/, function(req, res){
        var id = req.params[0]
          , op = req.params[1];
        res.end(op + 'ing user ' + id);
      });

      get(app, '/user/10/edit', function( res ) {
          res.body.should.equal( 'editing user 10' );

          done();
      });
    })
  })

  describe('case sensitivity', function(){
    it('should be disabled by default', function(done){
      var app = expression();

      app.get('/user', function(req, res){
        res.end('tj');
      });

      get(app, '/USER', function( res ) {
          res.body.should.equal( 'tj' );

          done();
      });
    })

    describe('when "case sensitive routing" is enabled', function(){
      it('should match identical casing', function(done){
        var app = expression();

        app.enable('case sensitive routing');

        app.get('/uSer', function(req, res){
          res.end('tj');
        });

        get(app, '/uSer', function( res ) {
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should not match otherwise', function(done){
        var app = expression();

        app.enable('case sensitive routing');

        app.get('/uSer', function(req, res){
          res.end('tj');
        });

        get(app, '/user', function( res ) {
            res.statusCode.should.equal( 404 );

            done();
        });
      })
    })
  })

  describe('params', function(){
      it('should overwrite existing req.params by default', function(done){
          var app = expression();
          var router = new expression.Router();

          router.get('/:action', function(req, res){
            res.send(req.params);
          });

          app.use('/user/:user', router);

          get(app, '/user/1/get', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( '{"action":"get"}' );

              done();
          });
      })

      it('should allow merging existing req.params', function(done){
          var app = expression();
          var router = new expression.Router({ mergeParams: true });

          router.get('/:action', function(req, res){
            var keys = Object.keys(req.params).sort();
            res.send(keys.map(function(k){ return [k, req.params[k]] }));
          });

          app.use('/user/:user', router);

          get(app, '/user/tj/get', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( '[["action","get"],["user","tj"]]' );

              done();
          });
      })

      it('should use params from router', function(done){
          var app = expression();
          var router = new expression.Router({ mergeParams: true });

          router.get('/:thing', function(req, res){
            var keys = Object.keys(req.params).sort();
            res.send(keys.map(function(k){ return [k, req.params[k]] }));
          });

          app.use('/user/:thing', router);

          get(app, '/user/tj/get', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( '[["thing","get"]]' );

              done();
          });
      })

      it.skip('should merge numeric indices req.params', function(done){
          var app = expression();
          var router = new expression.Router({ mergeParams: true });

          router.get('/*.*', function(req, res){
              var keys = Object.keys(req.params).sort();
              res.send(keys.map(function(k){ return [k, req.params[k]] }));
          });

          app.use('/user/id:(\\d+)', router);

          get(app, '/user/id:10/profile.json', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( '[["0","10"],["1","profile"],["2","json"]]' );

              done();
          });
      })

      it.skip('should merge numeric indices req.params when more in parent', function(done){
          var app = expression();
          var router = new expression.Router({ mergeParams: true });

          router.get('/*', function(req, res){
              var keys = Object.keys(req.params).sort();
              res.send(keys.map(function(k){ return [k, req.params[k]] }));
          });

          app.use('/user/id:(\\d+)/name:(\\w+)', router);

          get(app, '/user/id:10/name:tj/profile', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( '[["0","10"],["1","tj"],["2","profile"]]' );

              done();
          });
      })

      it('should ignore invalid incoming req.params', function(done){
          var app = expression();
          var router = new expression.Router({ mergeParams: true });

          router.get('/:name', function(req, res){
            var keys = Object.keys(req.params).sort();
            res.send(keys.map(function(k){ return [k, req.params[k]] }));
          });

          app.use('/user/', function (req, res, next) {
            req.params = 3; // wat?
            router(req, res, next);
          });

          get(app, '/user/tj', function( res ) {
              res.statusCode.should.equal( 200 );
              res.body.should.equal( '[["name","tj"]]' );

              done();
          });
      });
  });

  describe('trailing slashes', function(){

    it('should be optional by default', function(done){
      var app = expression();

      app.get('/user', function(req, res){
        res.end('tj');
      });

      get(app, '/user/', function( res ) {
          res.body.should.equal( 'tj' );

          done();
      });
    })

    describe('when "strict routing" is enabled', function(){
      it('should match trailing slashes', function(done){
        var app = expression();

        app.enable('strict routing');

        app.get('/user/', function(req, res){
          res.end('tj');
        });

        get(app, '/user/', function( res ) {
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should pass-though middleware', function(done){
        var app = expression();

        app.enable('strict routing');

        app.use(function (req, res, next) {
          res.setHeader('x-middleware', 'true');
          next();
        });

        app.get('/user/', function(req, res){
          res.end('tj');
        });

        get(app, '/user/', function( res ) {
            res.get('x-middleware').should.equal( 'true' );
            res.statusCode.should.equal( 200 );
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should pass-though mounted middleware', function(done){
        var app = expression();

        app.enable('strict routing');

        app.use('/user/', function (req, res, next) {
          res.setHeader('x-middleware', 'true');
          next();
        });

        app.get('/user/test/', function(req, res){
          res.end('tj');
        });

        get(app, '/user/test/', function( res ) {
            res.get('x-middleware').should.equal( 'true' );
            res.statusCode.should.equal( 200 );
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should match no slashes', function(done){
        var app = expression();

        app.enable('strict routing');

        app.get('/user', function(req, res){
          res.end('tj');
        });

        get(app, '/user', function( res ) {
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should match middleware when omitting the trailing slash', function(done){
        var app = expression();

        app.enable('strict routing');

        app.use('/user/', function(req, res){
          res.end('tj');
        });

        get(app, '/user', function( res ) {
            res.statusCode.should.equal( 200 );
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should match middleware', function(done){
        var app = expression();

        app.enable('strict routing');

        app.use('/user', function(req, res){
          res.end('tj');
        });

        get(app, '/user', function( res ) {
            res.statusCode.should.equal( 200 );
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should match middleware when adding the trailing slash', function(done){
        var app = expression();

        app.enable('strict routing');

        app.use('/user', function(req, res){
          res.end('tj');
        });

        get(app, '/user/', function( res ) {
            res.statusCode.should.equal( 200 );
            res.body.should.equal( 'tj' );

            done();
        });
      })

      it('should fail when omitting the trailing slash', function(done){
        var app = expression();

        app.enable('strict routing');

        app.get('/user/', function(req, res){
          res.end('tj');
        });

        get(app, '/user', function( res ) {
            res.statusCode.should.equal( 404 );

            done();
        });
      })

      it('should fail when adding the trailing slash', function(done){
        var app = expression();

        app.enable('strict routing');

        app.get('/user', function(req, res){
          res.end('tj');
        });

        get(app, '/user/', function( res ) {
            res.statusCode.should.equal( 404 );

            done();
        });
      })
    })
  })

  it.skip('should allow escaped regexp', function(done){
    var app = expression();

    app.get('/user/\\d+', function(req, res){
      res.end('woot');
    });

    get(app, '/user/10', function( res ) {
        res.statusCode.should.equal( 200 );

        get(app, '/user/tj', function( res ) {
            res.statusCode.should.equal( 404 );

            done();
        });
    });
  });

  it('should allow literal "."', function(done){
    var app = expression();

    app.get('/api/users/:from..:to', function(req, res){
      var from = req.params.from
        , to = req.params.to;

      res.end('users from ' + from + ' to ' + to);
    });

    get(app, '/api/users/1..50', function( res ) {
        res.body.should.equal( 'users from 1 to 50' );

        done();
    });
  });

  describe.skip('*', function(){
    it('should denote a greedy capture group', function(done){
      var app = expression();

      app.get('/user/*.json', function(req, res){
        res.end(req.params[0]);
      });

      get(app, '/user/tj.json', function( res ) {
          res.body.should.equal( 'tj' );

          done();
      });
    });

    it('should work with several', function(done){
      var app = expression();

      app.get('/api/*.*', function(req, res){
        var resource = req.params[0]
          , format = req.params[1];
        res.end(resource + ' as ' + format);
      });

      get(app, '/api/users/foo.bar.json', function( res ) {
          res.body.should.equal( 'users/foo.bar as json' );

          done();
      });
    });

    it('should work cross-segment', function(done){
      var app = expression();

      app.get('/api*', function(req, res){
        res.send(req.params[0]);
      });

      get(app, '/api', function( res ) {
          res.body.should.equal( '' );

          get(app, '/api/hey', function( res ) {
              res.body.should.equal( '/hey' );

              done();
          });
      });
    });

    it('should allow naming', function(done){
      var app = expression();

      app.get('/api/:resource(*)', function(req, res){
        var resource = req.params.resource;
        res.end(resource);
      });

      get(app, '/api/users/0.json', function( res ) {
          res.body.should.equal( 'users/0.json' );

          done();
      });
    });

    it('should not be greedy immediately after param', function(done){
      var app = expression();

      app.get('/user/:user*', function(req, res){
        res.end(req.params.user);
      });

      get(app, '/user/122', function( res ) {
          res.body.should.equal( '122' );

          done();
      });
    });

    it('should eat everything after /', function(done){
      var app = expression();

      app.get('/user/:user*', function(req, res){
        res.end(req.params.user);
      });

      get(app, '/user/122/aaa', function( res ) {
          res.body.should.equal( '122' );

          done();
      });
    });

    it('should span multiple segments', function(done){
      var app = expression();

      app.get('/file/*', function(req, res){
        res.end(req.params[0]);
      });

      get(app, '/file/javascripts/jquery.js', function( res ) {
          res.body.should.equal( 'javascripts/jquery.js' );

          done();
      });
    });

    it('should be optional', function(done){
      var app = expression();

      app.get('/file/*', function(req, res){
        res.end(req.params[0]);
      });

      get(app, '/file/', function( res ) {
          res.body.should.equal( '' );

          done();
      });
    });

    it('should require a preceding /', function(done){
      var app = expression();

      app.get('/file/*', function(req, res){
        res.end(req.params[0]);
      });

      get(app, '/file', function( res ) {
          res.statusCode.should.equal( 404 );

          done();
      });
    });
  });

  describe(':name', function(){
    it('should denote a capture group', function(done){
      var app = expression();

      app.get('/user/:user', function(req, res){
        res.end(req.params.user);
      });

      get(app, '/user/tj', function( res ) {
          res.body.should.equal( 'tj' );

          done();
      });
    });

    it('should match a single segment only', function(done){
      var app = expression();

      app.get('/user/:user', function(req, res){
        res.end(req.params.user);
      });

      get(app, '/user/tj/edit', function( res ) {
          res.statusCode.should.equal( 404 );

          done();
      });
    });

    it('should allow several capture groups', function(done){
      var app = expression();

      app.get('/user/:user/:op', function(req, res){
        res.end(req.params.op + 'ing ' + req.params.user);
      });

      get(app, '/user/tj/edit', function( res ) {
          res.body.should.equal( 'editing tj' );

          done();
      });
    });

    it('should work in array of paths', function(done){
      var app = expression();
      var cb = after(2, done);

      app.get(['/user/:user/poke', '/user/:user/pokes'], function(req, res){
        res.end('poking ' + req.params.user);
      });

      get(app, '/user/tj/poke', function( res ) {
          res.body.should.equal( 'poking tj' );

          cb();
      });

      get(app, '/user/tj/pokes', function( res ) {
          res.body.should.equal( 'poking tj' );

          cb();
      });
    });
  });

  describe(':name?', function(){
    it('should denote an optional capture group', function(done){
      var app = expression();

      app.get('/user/:user/:op?', function(req, res){
        var op = req.params.op || 'view';
        res.end(op + 'ing ' + req.params.user);
      });

      get(app, '/user/tj', function( res ) {
          res.body.should.equal( 'viewing tj' );

          done();
      });
    });

    it('should populate the capture group', function(done){
      var app = expression();

      app.get('/user/:user/:op?', function(req, res){
        var op = req.params.op || 'view';
        res.end(op + 'ing ' + req.params.user);
      });

      get(app, '/user/tj/edit', function( res ) {
          res.body.should.equal( 'editing tj' );

          done();
      });
    });
  });

  describe('.:name', function(){
    it('should denote a format', function(done){
      var app = expression();

      app.get('/:name.:format', function(req, res){
        res.end(req.params.name + ' as ' + req.params.format);
      });

      get(app, '/foo.json', function( res ) {
          res.body.should.equal( 'foo as json' );

          get(app, '/foo', function( res ) {
              res.statusCode.should.equal( 404 );

              done();
          });
      });
    });
  });

  describe('.:name?', function(){
    it('should denote an optional format', function(done){
      var app = expression();

      app.get('/:name.:format?', function(req, res){
        res.end(req.params.name + ' as ' + (req.params.format || 'html'));
      });

      get(app, '/foo', function( res ) {
          res.body.should.equal( 'foo as html' );

          get(app, '/foo.json', function( res ) {
              res.body.should.equal( 'foo as json' );

              done();
          });
      });
    });
  });

  describe('when next() is called', function(){
    it('should continue lookup', function(done){
      var app = expression()
        , calls = [];

      app.get('/foo/:bar?', function(req, res, next){
        calls.push('/foo/:bar?');
        next();
      });

      app.get('/bar', function(req, res){
        assert(0);
      });

      app.get('/foo', function(req, res, next){
        calls.push('/foo');
        next();
      });

      app.get('/foo', function(req, res, next){
        calls.push('/foo 2');
        res.end('done');
      });

      get(app, '/foo', function( res ) {
          res.body.should.equal( 'done' );

          calls.should.eql([ '/foo/:bar?', '/foo', '/foo 2' ]);

          done();
      });
    });
  });

  describe('when next("route") is called', function(){
    it('should jump to next route', function(done){
      var app = expression()

      function fn(req, res, next){
        res.set('X-Hit', '1')
        next('route')
      }

      app.get('/foo', fn, function(req, res, next){
        res.end('failure')
      });

      app.get('/foo', function(req, res){
        res.end('success')
      });

      get(app, '/foo', function( res ) {
          res.get( 'X-Hit' ).should.equal( '1' );
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'success' );

          done();
      });
    });
  });

  describe('when next(err) is called', function(){
    it('should break out of app.router', function(done){
      var app = expression()
        , calls = [];

      app.get('/foo/:bar?', function(req, res, next){
        calls.push('/foo/:bar?');
        next();
      });

      app.get('/bar', function(req, res){
        assert(0);
      });

      app.get('/foo', function(req, res, next){
        calls.push('/foo');
        next(new Error('fail'));
      });

      app.get('/foo', function(req, res, next){
        assert(0);
      });

      app.use(function(err, req, res, next){
        res.end(err.message);
      });

      get(app, '/foo', function( res ) {
          res.body.should.equal( 'fail' );
          calls.should.eql([ '/foo/:bar?', '/foo' ]);

          done();
      });
    });

    it('should call handler in same route, if exists', function(done){
      var app = expression();

      function fn1(req, res, next) {
        next(new Error('boom!'));
      }

      function fn2(req, res, next) {
        res.send('foo here');
      }

      function fn3(err, req, res, next) {
        res.send('route go ' + err.message);
      }

      app.get('/foo', fn1, fn2, fn3);

      app.use(function (err, req, res, next) {
        res.end('error!');
      });

      get(app, '/foo', function( res ) {
          res.body.should.equal( 'route go boom!' );

          done();
      });
    })
  })

  it('should allow rewriting of the url', function(done){
    var app = expression();

    app.get('/account/edit', function(req, res, next){
      req.user = { id: 12 }; // faux authenticated user
      req.url = '/user/' + req.user.id + '/edit';
      next();
    });

    app.get('/user/:id/edit', function(req, res){
      res.send('editing user ' + req.params.id);
    });

    get(app, '/account/edit', function( res ) {
        res.body.should.equal( 'editing user 12' );

        done();
    });
  });

  it.skip('should run in order added', function(done){
    var app = expression();
    var path = [];

    app.get('*', function(req, res, next){
      path.push(0);
      next();
    });

    app.get('/user/:id', function(req, res, next){
      path.push(1);
      next();
    });

    app.use(function(req, res, next){
      path.push(2);
      next();
    });

    app.all('/user/:id', function(req, res, next){
      path.push(3);
      next();
    });

    app.get('*', function(req, res, next){
      path.push(4);
      next();
    });

    app.use(function(req, res, next){
      path.push(5);
      res.end(path.join(','))
    });

    get(app, '/user/1', function( res ) {
        res.statusCode.should.equal( 200 );
        res.body.should.equal( '0,1,2,3,4,5' );

        done();
    });
  });

  it('should be chainable', function(){
      var app = expression();

      app.get('/', function() {}).should.equal( app );
  });
})
