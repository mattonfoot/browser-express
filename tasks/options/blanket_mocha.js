module.exports = function() {

    return {

        coverage: {
            options: {
                run: true,
                reporter: 'Spec',
                threshold : 70
            }

          , src: [ 'browser/**/*.html', '!browser/navigation.html' ]
        }

    };

};
