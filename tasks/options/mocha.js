module.exports = function() {

    return {

        test: {
            options: {
                run: true,
                reporter: 'Spec'
            }

          , src: [ 'browser/**/*.html', '!browser/navigation.html' ]
        }

    };

};
