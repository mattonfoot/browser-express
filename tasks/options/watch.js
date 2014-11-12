module.exports = function( config ) {

    return {

        test: {
            files: 'tests/**/*.js',
            tasks: [ 'build', 'test' ]
        },

        src: {
            files: 'lib/**/*',
            tasks: [ 'build', 'test' ]
        }

    };

};
