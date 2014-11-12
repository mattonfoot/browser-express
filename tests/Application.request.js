
var expression = require('../');
var request = require('./request');
var get = request.get;

describe('app', function(){
    describe('.request', function(){
        it('should extend the request prototype', function(done){
            var app = expression();

            app.request.querystring = function() {
                return require('url').parse( this.url ).query;
            };

            app.use(function( req, res ) {
                res.end( req.querystring() );
            });

            get(app, '/foo?name=tobi', function( res ) {
                res.body.should.equal( 'name=tobi' );

                done();
            });
        });
    });
});
