var mocha = require('mocha');

module.exports = function() {

    var tests = [ 'browser/**/*.html', '!browser/navigation.html' ];

    var configSlow = 100;
    var configTimeout = 1000;

    return {

        test: {
            options: {
                run: true,
                bail: true

              , reporter: 'Spec'
              , slow: configSlow
              , timeout: configTimeout
            }

          , src: tests
        }

    };

};
