module.exports = function( config ) {

    return {

        test: {
            files: 'tests/**/*.*',
            tasks: [ 'test' ]
        },

        src: {
            files: 'lib/**/*',
            tasks: [ 'test' ]
        }

    };

};
