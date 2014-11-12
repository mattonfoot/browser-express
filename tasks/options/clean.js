module.exports = function( config ) {

    return {
        coverage: {
            src: [ 'dist/', 'browser/', 'reports/', 'coverage/' ]
        },

        dist: {
            src: [ 'dist/' ]
        }
    };

};
