module.exports = function( config ) {

    return {
        dist: {
            options: {
                mangle: true,
                preserveComments: false,
                sourceMap: true,
                sourceMapName: 'dist/browser-express.map',
                compress: {
                  sequences: true,
                  dead_code: true,
                  conditionals: true,
                  booleans: true,
                  unused: true,
                  if_return: true,
                  join_vars: true,
                  drop_console: true
                }
            },

            files: {
                "dist/browser-express.min.js": "dist/browser-express.js"
            }
        }
    };

};
