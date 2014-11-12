
var expression = require('../');
var request = require('./request');
var get = request.get;

describe('app', function(){
    describe('.response', function(){
        it('should extend the response prototype', function(done){
            var app = expression();

            app.response.shout = function(str){
                this.send(str.toUpperCase());
            };

            app.use(function(req, res){
                res.shout('hey');
            });

            get(app, '/', function( res ) {
                res.body.should.equal( 'HEY' );

                done();
            });
        });

        it('should not be influenced by other app protos', function(done){
            var app = expression();
            var app2 = expression();

            app.response.shout = function(str){
                this.send(str.toUpperCase());
            };

            app2.response.shout = function(str){
                this.send(str);
            };

            app.use(function(req, res){
                res.shout('hey');
            });

            get(app, '/', function( res ) {
                res.body.should.equal( 'HEY' );

                done();
            });
        });
    });
});
