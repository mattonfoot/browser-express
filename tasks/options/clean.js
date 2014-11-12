module.exports = function( config ) {

    return {
        coverage: {
            src: [ 'reports/', 'coverage/' ]
        },

        test: {
            src: [ 'browser/' ]
        },

        dist: {
            src: [ 'dist/' ]
        }
    };

};
