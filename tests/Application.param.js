
var express = require('../');
var request = require('./request');
var get = request.get;

describe('app', function(){
  describe('.param(fn)', function(){
    it('should map app.param(name, ...) logic', function(done){
      var app = express();

      app.param(function(name, regexp){
          if (Object.prototype.toString.call(regexp) == '[object RegExp]') { // See #1557
              return function(req, res, next, val){
                var captures;
                if (captures = regexp.exec(String(val))) {
                    req.params[ name ] = captures[ 1 ];
                    next();
                } else {
                    next('route');
                }
              }
          }
      });

      app.param(':name', /^([a-zA-Z]+)$/);

      app.get('/user/:name', function(req, res){
          res.send( req.params.name );
      });

      get(app, '/user/tj', function( res ) {
          res.body.should.equal( 'tj' );

          get(app, '/user/123', function( res ) {
              res.statusCode.should.equal( 404 );

              done();
          });
      });
    });

    it('should fail if not given fn', function(){
        var app = express();

        function fixture() {
            app.param( ':name', 'bob' );
        }

        fixture.should.throw( Error );
    });
  });

  describe('.param(names, fn)', function(){
      it('should map the array', function(done){
          var app = express();

          app.param([ 'id', 'uid' ], function(req, res, next, id){
            id = Number(id);
            if (isNaN(id)) return next('route');
            req.params.id = id;
            next();
          });

          app.get('/post/:id', function(req, res){
            var id = req.params.id;
            id.should.be.a.Number;
            res.send('' + id);
          });

          app.get('/user/:uid', function(req, res){
            var id = req.params.id;
            id.should.be.a.Number;
            res.send('' + id);
          });

          get(app, '/user/123', function( res ) {
              res.body.should.equal( '123' );

              get(app, '/post/123', function( res ) {
                      res.body.should.equal( '123' );

                  done();
              });
          });
      });
  });

  describe('.param(name, fn)', function(){
    it('should map logic for a single param', function(done){
      var app = express();

      app.param('id', function(req, res, next, id){
        id = Number(id);
        if (isNaN(id)) return next('route');
        req.params.id = id;
        next();
      });

      app.get('/user/:id', function(req, res){
        var id = req.params.id;
        id.should.be.a.Number;
        res.send('' + id);
      });

      get(app, '/user/123', function( res ) {
          res.body.should.equal( '123' );

          done();
      });
    })

    it('should only call once per request', function(done) {
      var app = express();
      var called = 0;
      var count = 0;

      app.param('user', function(req, res, next, user) {
        called++;
        req.user = user;
        next();
      });

      app.get('/foo/:user', function(req, res, next) {
        count++;
        next();
      });
      app.get('/foo/:user', function(req, res, next) {
        count++;
        next();
      });
      app.use(function(req, res) {
        res.end([count, called, req.user].join(' '));
      });

      get(app, '/foo/bob', function( res ) {
          res.body.should.equal( '2 1 bob' );

          done();
      });
    })

    it('should call when values differ', function(done) {
      var app = express();
      var called = 0;
      var count = 0;

      app.param('user', function(req, res, next, user) {
        called++;
        req.users = (req.users || []).concat(user);
        next();
      });

      app.get('/:user/bob', function(req, res, next) {
        count++;
        next();
      });
      app.get('/foo/:user', function(req, res, next) {
        count++;
        next();
      });
      app.use(function(req, res) {
        res.end([count, called, req.users.join(',')].join(' '));
      });

      get(app, '/foo/bob', function( res ) {
          res.body.should.equal( '2 2 foo,bob' );

          done();
      });
    })

    it('should support altering req.params across routes', function(done) {
      var app = express();

      app.param('user', function(req, res, next, user) {
        req.params.user = 'loki';
        next();
      });

      app.get('/:user', function(req, res, next) {
        next('route');
      });
      app.get('/:user', function(req, res, next) {
        res.send(req.params.user);
      });

      get(app, '/bob', function( res ) {
          res.body.should.equal( 'loki' );

          done();
      });
    })

    it('should not invoke without route handler', function(done) {
      var app = express();

      app.param('thing', function(req, res, next, thing) {
        req.thing = thing;
        next();
      });

      app.param('user', function(req, res, next, user) {
        next(new Error('invalid invokation'));
      });

      app.post('/:user', function(req, res, next) {
        res.send(req.params.user);
      });

      app.get('/:thing', function(req, res, next) {
        res.send(req.thing);
      });

      get(app, '/bob', function( res ) {
          res.statusCode.should.equal( 200 );
          res.body.should.equal( 'bob' );

          done();
      });
    })

    it('should work with encoded values', function(done){
      var app = express();

      app.param('name', function(req, res, next, name){
        req.params.name = name;
        next();
      });

      app.get('/user/:name', function(req, res){
        var name = req.params.name;
        res.send('' + name);
      });

      get(app, '/user/foo%25bar', function( res ) {
          res.body.should.equal( 'foo%bar' );

          done();
      });
    })

    it('should catch thrown error', function(done){
      var app = express();

      app.param('id', function(req, res, next, id){
        throw new Error('err!');
      });

      app.get('/user/:id', function(req, res){
        var id = req.params.id;
        res.send('' + id);
      });

      get(app, '/user/123', function( res ) {
          res.statusCode.should.equal( 500 );

          done();
      });
    })

    it('should catch thrown secondary error', function(done){
      var app = express();

      app.param('id', function(req, res, next, val){
        process.nextTick(next);
      });

      app.param('id', function(req, res, next, id){
        throw new Error('err!');
      });

      app.get('/user/:id', function(req, res){
        var id = req.params.id;
        res.send('' + id);
      });

      get(app, '/user/123', function( res ) {
          res.statusCode.should.equal( 500 );

          done();
      });
    })

    it('should defer to next route', function(done){
      var app = express();

      app.param('id', function(req, res, next, id){
        next('route');
      });

      app.get('/user/:id', function(req, res){
        var id = req.params.id;
        res.send('' + id);
      });

      app.get('/:name/123', function(req, res){
        res.send('name');
      });

      get(app, '/user/123', function( res ) {
          res.body.should.equal( 'name' );

          done();
      });
    })

    it('should defer all the param routes', function(done){
      var app = express();

      app.param('id', function(req, res, next, val){
        if (val === 'new') return next('route');
        return next();
      });

      app.all('/user/:id', function(req, res){
        res.send('all.id');
      });

      app.get('/user/:id', function(req, res){
        res.send('get.id');
      });

      app.get('/user/new', function(req, res){
        res.send('get.new');
      });

      get(app, '/user/new', function( res ) {
          res.body.should.equal( 'get.new' );

          done();
      });
    });
  });
});
