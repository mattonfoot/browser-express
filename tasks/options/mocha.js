

module.exports = function() {

  return {

    test: {
      options: {
        run: true,
        reporter: 'Spec'
      },

      src: [ 'browser/**/*.html', '!browser/navigation.html' ]
    },

    junit: {
      options: {
        run: true,
        reporter: 'mocha-junit-reporter',
        captureFile: 'reports/junit.xml'
      },

      src: [ 'browser/**/*.html', '!browser/navigation.html' ]
    }

  };

};
