module.exports = function( grunt )
{
    'use strict';

    // helper function to load task configs

    function loadConfig( path, config ) {
        var glob = require( 'glob' )
          , object = {}
          , key;

        glob.sync('*', { cwd: path })
            .forEach(function( option ) {
                key = option.replace( /\.js$/, '' );
                object[key] = require( path + option )( config );
            });

        return object;
    }

    // actual config

    var config = {

        pkg: grunt.file.readJSON('package.json')

      , env: process.env

    };

    grunt.util._.extend(config, loadConfig( './tasks/options/', config ));

    grunt.initConfig(config);

    // load grunt tasks
    require('load-grunt-tasks')(grunt);

    // local tasks
    grunt.loadTasks('tasks');




    // clean
    // grunt.registerTask('clean'         , [ 'clean' ]);

    // lint
    grunt.registerTask('lint:test'        , [ 'jshint:test', 'eslint:test' ]);
    grunt.registerTask('lint:src'         , [ 'jshint:src', 'eslint:src' ]);
    grunt.registerTask('lint'             , [ 'lint:test', 'lint:src' ]);

    //prepare
    grunt.registerTask('prepare:test'     , [ 'clean:test', 'copy:test', 'copy:support', 'browserify:test' ]);
    grunt.registerTask('prepare:src'      , [ 'clean:dist', 'browserify:dist' ]);
    grunt.registerTask('prepare'          , [ 'prepare:test', 'prepare:coverage', 'prepare:src' ]);

    // test
    grunt.registerTask('coverage'         , [ 'prepare:test', 'blanket_mocha:coverage' ]);
  	var testJobs                          = [ 'prepare:test' ];
	  if (typeof config.env.SAUCE_ACCESS_KEY !== 'undefined') {
        testJobs.push( 'connect:test' );
        testJobs.push( 'saucelabs-mocha' );
  	} else {
        testJobs.push( 'mocha:test' );
    }
    grunt.registerTask('test'             , testJobs);

    // prepare
    grunt.registerTask('build'            , [ 'prepare:src' ]);

    // auto build
    grunt.registerTask('default'          , [ 'watch' ]);

    // ci
    grunt.registerTask('ci'               , [ 'build', 'test', 'coverage', 'coveralls' ]);

};
