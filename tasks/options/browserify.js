module.exports = function( config ) {
    /*
    var override = require('browserify-override').rules({
        'fs.js': {
            action: 'define',
            with: 'fs',
            from: 'etag'
        }
    });
*/
    return {
        options: {
            //transform: [ override ]
        },

        test: {
            files: {
                'browser/all.js': [ './tests/all.js' ],
                'browser/browser-express.js': [ './index.js' ],
                'browser/navigation.js': [ './lib/navigation/index.js' ]
            }
        },

        dist: {
            files: {
                'dist/browser-express.js': [ './index.js' ],
                'dist/navigation.js': [ './lib/navigation/index.js' ]
            }
        }

    };
};
