'use strict';

var chai = require('chai');
var should = chai.should();

/*global describe: false */
/*global it: false */
/*global window: false */

var express = require('../');
var request = require('./request');
var get = request.get;

describe('app', function(){
    describe('.render(name, fn)', function(){
        it('should support absolute paths', function(done){
          var app = expression();

          app.locals.user = { name: 'tobi' };

          app.render( '/fixtures/user.jade', function(err, str){
            if (err) return done(err);
            str.should.equal('<p>tobi</p>');
            done();
          });
        });

        it('should support absolute paths with "view engine"', function(done){
          var app = expression();

          app.set('view engine', 'jade');
          app.locals.user = { name: 'tobi' };

          app.render( '/fixtures/user', function(err, str){
            if (err) return done(err);
            str.should.equal('<p>tobi</p>');
            done();
          });
        });

        it('should expose app.locals', function(done){
          var app = expression();

          app.set('views',  '/fixtures');
          app.locals.user = { name: 'tobi' };

          app.render('user.jade', function(err, str){
            if (err) return done(err);
            str.should.equal('<p>tobi</p>');
            done();
          });
        });

        it('should support index.<engine>', function(done){
          var app = expression();

          app.set('views',  '/fixtures');
          app.set('view engine', 'jade');

          app.render('blog/post', function(err, str){
            if (err) return done(err);
            str.should.equal('<h1>blog post</h1>');
            done();
          });
        });

        it('should handle render error throws', function(done){
            var app = expression();

            function View(name, options){
                this.name = name;
                this.template = 'fake';
            }

            View.prototype.render = function( options, fn ) {
                throw new Error( 'err!' );
            };

            app.set('view', View);

            app.render('something', function(err, str){
                err.should.be.ok;
                err.message.should.equal('err!');
                done();
            });
        });

        describe('when the file does not exist', function(){
            it('should provide a helpful error', function(done){
                var app = expression();
                app.set('views',  '/fixtures');
                app.render('rawr.jade', function(err){
                    err.message.should.equal('Failed to lookup view "rawr.jade" in views namespace "' +  '/fixtures"');
                    done();
                });
            });
        });

        describe('when an error occurs', function(){
            it('should invoke the callback', function(done){
                var app = expression();

                app.set('views',  '/fixtures');

                app.render('user.jade', function(err, str){
                    // nextTick to prevent cyclic
                    process.nextTick(function(){
                        try {
                          err.message.should.match( /Cannot read property '[^']+' of undefined/ );
                        } catch( err ) {

                            try {
                                err.message.should.match( /is not an object \(evaluating / ); // phantomjs error is different from jade
                            } catch( err ) {
                                return done( err );
                            }
                        }

                        done();
                    });
                });
            });
        });

        describe('when an extension is given', function(){
            it('should render the template', function(done){
                var app = expression();

                app.set('views',  '/fixtures');

                app.render('email.jade', function(err, str){
                    if (err) return done(err);
                    str.should.equal('<p>This is an email</p>');
                    done();
                });
            });
        });

        describe('when "view engine" is given', function(){
            it('should render the template', function(done){
                var app = expression();

                app.set('view engine', 'jade');
                app.set('views',  '/fixtures');

                app.render('email', function(err, str){
                    if (err) return done(err);
                    str.should.equal('<p>This is an email</p>');
                    done();
                });
            });
        });

        describe('when "views" is given', function(){
            it('should lookup the file in the path', function(done){
                var app = expression();

                app.set('views',  '/fixtures/default_layout');
                app.locals.user = { name: 'tobi' };

                app.render('user.jade', function(err, str){
                    if (err) return done(err);
                    str.should.equal('<p>tobi</p>');
                    done();
                });
            });

            describe('when array of paths', function(){
                it('should lookup the file in the path', function(done){
                    var app = expression();
                    var views = [ '/fixtures/local_layout',  '/fixtures/default_layout'];

                    app.set('views', views);
                    app.locals.user = { name: 'tobi' };

                    app.render('user.jade', function(err, str){
                        if (err) return done(err);
                        str.should.equal('<span>tobi</span>');
                        done();
                    });
                });

                it('should lookup in later paths until found', function(done){
                    var app = expression();
                    var views = [ '/fixtures/local_layout',  '/fixtures/default_layout'];

                    app.set('views', views);
                    app.locals.name = 'tobi';

                    app.render('name.jade', function(err, str){
                        if (err) return done(err);
                        str.should.equal('<p>tobi</p>');
                        done();
                    });
                });

                it('should error if file does not exist', function(done){
                    var app = expression();
                    var views = [ '/fixtures/local_layout',  '/fixtures/default_layout'];

                    app.set('views', views);
                    app.locals.name = 'tobi';

                    app.render('pet.jade', function(err, str){
                        err.message.should.equal('Failed to lookup view "pet.jade" in views namespaces "' +  '/fixtures/local_layout" or "' +  '/fixtures/default_layout"');
                        done();
                    });
                });
            });
        });

        describe('when a "view" constructor is given', function(){
            it('should create an instance of it', function(done){
                var app = expression();

                function View(name, options){
                  this.name = name;
                  this.template = 'path is required by application.js as a signal of success even though it is not used there.';
                }

                View.prototype.render = function(options, fn){
                  fn(null, 'abstract engine');
                };

                app.set('view', View);

                app.render('something', function(err, str){
                    if (err) return done(err);
                    str.should.equal('abstract engine');
                    done();
                });
            });
        });

        describe('caching', function(){
            it('should always lookup view without cache', function(done){
                var app = expression();
                var count = 0;

                function View(name, options){
                  this.name = name;
                  this.template = 'fake';
                  count++;
                }

                View.prototype.render = function(options, fn){
                  fn(null, 'abstract engine');
                };

                app.set('view cache', false);
                app.set('view', View);

                app.render('something', function(err, str){
                    if (err) return done(err);
                    count.should.equal(1);
                    str.should.equal('abstract engine');
                    app.render('something', function(err, str){
                        if (err) return done(err);
                        count.should.equal(2);
                        str.should.equal('abstract engine');
                        done();
                    });
                });
            });

            it('should cache with "view cache" setting', function(done){
                var app = expression();
                var count = 0;

                function View(name, options){
                  this.name = name;
                  this.template = 'fake';
                  count++;
                }

                View.prototype.render = function(options, fn){
                  fn(null, 'abstract engine');
                };

                app.set('view cache', true);
                app.set('view', View);

                app.render('something', function(err, str){
                    if (err) return done(err);
                    count.should.equal(1);
                    str.should.equal('abstract engine');
                    app.render('something', function(err, str){
                        if (err) return done(err);
                        count.should.equal(1);
                        str.should.equal('abstract engine');
                        done();
                    });
                });
            });
        });
      });

      describe('.render(name, options, fn)', function(){
          it('should render the template', function(done){
              var app = expression();

              app.set('views',  '/fixtures');

              var user = { name: 'tobi' };

              app.render('user.jade', { user: user }, function(err, str){
                  if (err) return done(err);
                  str.should.equal('<p>tobi</p>');
                  done();
              });
          });

          it('should expose app.locals', function(done){
              var app = expression();

              app.set('views',  '/fixtures');
              app.locals.user = { name: 'tobi' };

              app.render('user.jade', {}, function(err, str){
                  if (err) return done(err);
                  str.should.equal('<p>tobi</p>');
                  done();
              });
          });

          it('should give precedence to app.render() locals', function(done){
              var app = expression();

              app.set('views',  '/fixtures');
              app.locals.user = { name: 'tobi' };
              var jane = { name: 'jane' };

              app.render('user.jade', { user: jane }, function(err, str){
                  if (err) return done(err);
                  str.should.equal('<p>jane</p>');
                  done();
              });
          });

          describe('caching', function(){
              it('should cache with cache option', function(done){
                  var app = expression();
                  var count = 0;

                  function View(name, options){
                    this.name = name;
                    this.template = 'fake';
                    count++;
                  }

                  View.prototype.render = function(options, fn){
                    fn(null, 'abstract engine');
                  };

                  app.set('view cache', false);
                  app.set('view', View);

                  app.render('something', {cache: true}, function(err, str){
                    if (err) return done(err);
                    count.should.equal(1);
                    str.should.equal('abstract engine');
                    app.render('something', {cache: true}, function(err, str){
                        if (err) return done(err);
                        count.should.equal(1);
                        str.should.equal('abstract engine');
                        done();
                    });
                });
            });
        });
    });
});
