module.exports = function( config ) {

    return {

        options: {
            jshintrc  : true
        }

      , test        : [ 'tests/**/*.js' ]

      , src         : [ 'lib/**/*.js' ]

    };

};
