'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false*/
/*global it: false*/

/*eslint-disable handle-callback-err */

var after = require('after');
var Router = require('../lib/router');
var expressRouter = Router;
var methods = require('methods');

describe('Router', function(){
  it('should return a function with router methods', function() {
    var router = expressRouter();
    router.should.be.a( 'function' );

    router = new Router();
    router.should.be.a( 'function' );

    router.get.should.be.a( 'function' );
    router.handle.should.be.a( 'function' );
    router.use.should.be.a( 'function' );
  });

  it('should support .use of other routers', function(done){
    var router = new Router();
    var another = new Router();

    another.get('/bar', function(req, res){
        res.end();
    });
    router.use( '/foo', another );

    router.handle({ url: '/foo/bar', method: 'GET' }, { end: done });
  });

  it('should support dynamic routes', function(done){
    var router = new Router();
    var another = new Router();

    another.get('/:bar', function(req, res){
      req.params.bar.should.equal('route');
      res.end();
    });
    router.use('/:foo', another);

    router.handle({ url: '/test/route', method: 'GET' }, { end: done });
  });

  it('should handle blank URL', function(done){
    var router = new Router();

    router.use(function (req, res) {
      var ok = false.should.be.true;
    });

    router.handle({ url: '', method: 'GET' }, {}, done);
  });

  describe('.handle', function(){
    it('should dispatch', function(done){
      var router = new Router();

      router.route('/foo').get(function(req, res){
        res.send('foo');
      });

      var res = {
        send: function(val) {
          val.should.equal('foo');
          done();
        }
      };

      router.handle({ url: '/foo', method: 'GET' }, res);
    });
  });

  describe('.multiple callbacks', function(){
    it('should throw if a callback is null', function(){
        var router = new Router();

        function fixture() {
            router.route('/foo').all( null );
        }

        fixture.should.throw( Error );
    });

    it('should throw if a callback is undefined', function(){
        var router = new Router();

        function fixture() {
            router.route('/foo').all( undefined );
        }

        fixture.should.throw( Error );
    });

    it('should throw if a callback is not a function', function(){
        var router = new Router();

        function fixture() {
            router.route('/foo').all( 'not a function' );
        }

        fixture.should.throw( Error );
    });

    it('should not throw if all callbacks are functions', function(){
      var router = new Router();
      router.route('/foo').all(function(){}).all(function(){});
    });
  });

  describe('error', function(){
    it('should skip non error middleware', function(done){
      var router = new Router();

      router.get('/foo', function(req, res, next){
        next(new Error('foo'));
      });

      router.get('/bar', function(req, res, next){
        next(new Error('bar'));
      });

      router.use(function(req, res, next){
        var skipped = false.should.be.true;
      });

      router.use(function(err, req, res, next){
        err.message.should.equal( 'foo' );
        done();
      });

      router.handle({ url: '/foo', method: 'GET' }, {}, done);
    });

    it('should handle throwing inside routes with params', function(done) {
      var router = new Router();

      router.get('/foo/:id', function(req, res, next){
        throw new Error('foo');
      });

      router.use(function(req, res, next){
        var skipped = false.should.be.true;
      });

      router.use(function(err, req, res, next){
        err.message.should.equal( 'foo' );
        done();
      });

      router.handle({ url: '/foo/2', method: 'GET' }, {}, function() {});
    });

    it('should handle throwing in handler after async param', function(done) {
      var router = new Router();

      router.param('user', function(req, res, next, val){
        process.nextTick(function(){
          req.user = val;
          next();
        });
      });

      router.use('/:user', function(req, res, next){
        throw new Error('oh no!');
      });

      router.use(function(err, req, res, next){
        err.message.should.equal( 'oh no!' );
        done();
      });

      router.handle({ url: '/bob', method: 'GET' }, {}, function() {});
    });

    it('should handle throwing inside error handlers', function(done) {
      var router = new Router();

      router.use(function(req, res, next){
        throw new Error('boom!');
      });

      router.use(function(err, req, res, next){
        throw new Error('oops');
      });

      router.use(function(err, req, res, next){
        err.message.should.equal( 'oops' );
        done();
      });

      router.handle({ url: '/', method: 'GET' }, {}, done);
    });
  });

  describe('FQDN', function () {
    it('should not obscure FQDNs', function (done) {
      var request = { hit: 0, url: 'http://example.com/foo', method: 'GET' };
      var router = new Router();

      router.use(function (req, res, next) {
        (req.hit++).should.equal( 0 );
        req.url.should.equal( 'http://example.com/foo' );
        next();
      });

      router.handle(request, {}, function (err) {
        if (err) {
            return done(err);
        }
        request.hit.should.equal( 1 );
        done();
      });
    });

    it('should ignore FQDN in search', function (done) {
      var request = { hit: 0, url: '/proxy?url=http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/proxy', function (req, res, next) {
          (req.hit++).should.equal( 0 );
          req.url.should.equal( '/?url=http://example.com/blog/post/1' );
          next();
      });

      router.handle(request, {}, function (err) {
          if (err) {
              return done(err);
          }
          request.hit.should.equal( 1 );
          done();
      });
    });

    it('should adjust FQDN req.url', function (done) {
      var request = { hit: 0, url: 'http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/blog', function (req, res, next) {
          (req.hit++).should.equal( 0 );
        req.url.should.equal( 'http://example.com/post/1' );
        next();
      });

      router.handle(request, {}, function (err) {
          if (err) {
              return done(err);
          }
          request.hit.should.equal( 1 );
          done();
      });
    });

    it('should adjust FQDN req.url with multiple handlers', function (done) {
      var request = { hit: 0, url: 'http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use(function (req, res, next) {
          (req.hit++).should.equal( 0 );
        req.url.should.equal( 'http://example.com/blog/post/1' );
        next();
      });

      router.use('/blog', function (req, res, next) {
            (req.hit++).should.equal( 1 );
        req.url.should.equal( 'http://example.com/post/1');
        next();
      });

      router.handle(request, {}, function (err) {
          if (err) {
              return done(err);
          }
          request.hit.should.equal( 2 );
          done();
      });
    });

    it('should adjust FQDN req.url with multiple routed handlers', function (done) {
      var request = { hit: 0, url: 'http://example.com/blog/post/1', method: 'GET' };
      var router = new Router();

      router.use('/blog', function (req, res, next) {
        req.hit.should.equal( 0 );
        req.hit++;
        req.url.should.equal( 'http://example.com/post/1' );
        next();
      });

      router.use('/blog', function (req, res, next) {
          req.hit.should.equal( 1 );
          req.hit++;
        req.url.should.equal( 'http://example.com/post/1');
        next();
      });

      router.use(function (req, res, next) {
          req.hit.should.equal( 2 );
          req.hit++;
          req.url.should.equal( 'http://example.com/blog/post/1');
          next();
      });

      router.handle(request, {}, function (err) {
          if (err) {
              return done(err);
          }
          request.hit.should.equal( 3 );
          done();
      });
    });
  });

  describe('.all', function() {
    it('should support using .all to capture all http verbs', function(done){
      var router = new Router();

      var count = 0;
      router.all('/foo', function() {
          count++;
      });

      var url = '/foo?bar=baz';

      methods.forEach(function testMethod(method) {
        router.handle({ url: url, method: method }, {}, function() {});
      });

      count.should.equal( methods.length);
      done();
    });
  });

  describe('.use', function() {
    it('should require arguments', function(){
      var router = new Router();

      function fixture() {
          router.use();
      }

      fixture.should.throw(/requires middleware function/);
    });

    it('should not accept non-functions', function(){
      var router = new Router();

      function fixture1() {
          router.use( '/', 'hello' );
      }
      fixture1.should.throw(/requires middleware function.*string/);

      function fixture2() {
          router.use( '/', 5 );
      }
      fixture2.should.throw(/requires middleware function.*number/);

      function fixture3() {
          router.use( '/', null );
      }
      fixture3.should.throw(/requires middleware function.*Null/); // should be Null

      function fixture4() {
          router.use( '/', new Date() );
      }
      fixture4.should.throw(/requires middleware function.*Date/);
    });

    it('should accept array of middleware', function(done){
      var count = 0;
      var router = new Router();

      function fn1(req, res, next){
        (++count).should.equal( 1 );
        next();
      }

      function fn2(req, res, next){
        (++count).should.equal( 2 );
        next();
      }

      router.use([ fn1, fn2 ], function(req, res){
        (++count).should.equal( 3 );
        done();
      });

      router.handle({ url: '/foo', method: 'GET' }, {}, function(){});
    });
  });

  describe('.param', function() {
    it('should call param function when routing VERBS', function(done) {
      var router = new Router();

      router.param('id', function(req, res, next, id) {
        id.should.equal( '123');
        next();
      });

      router.get('/foo/:id/bar', function(req, res, next) {
        req.params.id.should.equal( '123');
        next();
      });

      router.handle({ url: '/foo/123/bar', method: 'get' }, {}, done);
    });

    it('should call param function when routing middleware', function(done) {
      var router = new Router();

      router.param('id', function(req, res, next, id) {
        id.should.equal( '123');
        next();
      });

      router.use('/foo/:id/bar', function(req, res, next) {
        req.params.id.should.equal( '123');
        req.url.should.equal( '/baz');
        next();
      });

      router.handle({ url: '/foo/123/bar/baz', method: 'get' }, {}, done);
    });

    it('should only call once per request', function(done) {
      var count = 0;
      var req = { url: '/foo/bob/bar', method: 'get' };
      var router = new Router();
      var sub = new Router();

      sub.get('/bar', function(req, res, next) {
        next();
      });

      router.param('user', function(req, res, next, user) {
        count++;
        req.user = user;
        next();
      });

      router.use('/foo/:user/', new Router());
      router.use('/foo/:user/', sub);

      router.handle(req, {}, function(err) {
        if (err) {
            return done(err);
        }
        count.should.equal( 1 );
        req.user.should.equal( 'bob' );
        done();
      });
    });

    it('should call when values differ', function(done) {
      var count = 0;
      var req = { url: '/foo/bob/bar', method: 'get' };
      var router = new Router();
      var sub = new Router();

      sub.get('/bar', function(req, res, next) {
        next();
      });

      router.param('user', function(req, res, next, user) {
        count++;
        req.user = user;
        next();
      });

      router.use('/foo/:user/', new Router());
      router.use('/:user/bob/', sub);

      router.handle(req, {}, function(err) {
        if (err) {
            return done(err);
        }
        count.should.equal( 2 );
        req.user.should.equal( 'foo' );
        done();
      });
    });
  });

  describe('parallel requests', function() {
    it('should not mix requests', function(done) {
      var req1 = { url: '/foo/50/bar', method: 'get' };
      var req2 = { url: '/foo/10/bar', method: 'get' };
      var router = new Router();
      var sub = new Router();

      done = after(2, done);

      sub.get('/bar', function(req, res, next) {
        next();
      });

      router.param('ms', function(req, res, next, ms) {
        ms = parseInt(ms, 10);
        req.ms = ms;
        setTimeout(next, ms);
      });

      router.use('/foo/:ms/', new Router());
      router.use('/foo/:ms/', sub);

      router.handle(req1, {}, function(err) {
        should.exist( err );
        err.should.be.instanceOf( Error );

        req1.ms.should.equal( 50 );
        req1.originalUrl.should.equal( '/foo/50/bar' );
        done();
      });

      router.handle(req2, {}, function(err) {
        should.exist( err );
        err.should.be.instanceOf( Error );

        req2.ms.should.equal( 10 );
        req2.originalUrl.should.equal( '/foo/10/bar' );
        done();
      });
    });
  });

});
