module.exports = function( config ) {

    var base = [ './' ];

    return {

        dev: {
            options: {
                keepAlive: true,
                useAvailablePort: true,
                base: base
            }
        },

        test: {
            options: {
                port: config.env.CONNECT_PORT || 9001
            }
        }

    };

};
