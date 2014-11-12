module.exports = function( config ) {

    return {

        coverage: {
            src:    [ 'browser/tests/**' ],
            dest:   'coverage/'
        },

        test: {
            expand: true,     // Enable dynamic expansion.
            cwd: 'tests/',      // Src matches are relative to this path.
            src: ['**/*.html'], // Actual pattern(s) to match.
            dest: 'browser/',   // Destination path prefix.
        },

        support: {
            expand: true,     // Enable dynamic expansion.
            cwd: 'tests/support/',      // Src matches are relative to this path.
            src: ['**/*.*'], // Actual pattern(s) to match.
            dest: 'browser/support/',   // Destination path prefix.
        },

        dist: {
            expand: true,     // Enable dynamic expansion.
            cwd: 'lib/',      // Src matches are relative to this path.
            src: ['**/*.js'], // Actual pattern(s) to match.
            dest: 'dist/',   // Destination path prefix.
        }
    };

};
