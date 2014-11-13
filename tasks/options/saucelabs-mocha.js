module.exports = function( config ) {

    var url = 'http://127.0.0.1:'+ (config.env.CONNECT_PORT || 9001) +'/browser/sauce.html';

    return {

        test: {

    				options: {
    					username: 'mattonfoot',
    					key: config.env.SAUCE_ACCESS_KEY || '',
    					tags: [ 'master', config.pkg.name ],
    					urls: [ url ],
              testname: config.pkg.name + ' [' + config.pkg.version + ']',
              build: config.pkg.version,
    					browsers: [
                  { browserName: 'chrome' }, // latest
                  { browserName: 'safari' }, // latest
                  { browserName: 'firefox' }, // latest
                  { browserName: 'internet explorer' }, // latest
                  /*
                  { browserName: 'internet explorer' version: '10' },
                  { browserName: 'internet explorer', version: '9' },
                  { browserName: 'internet explorer', platform: 'Windows 7', version: '8' },
                  { browserName: 'internet explorer', platform: 'Windows XP', version: '8' },
                  { browserName: 'internet explorer', version: '7' },
                  { browserName: 'internet explorer', version: '6' },
                  */
                  { browserName: 'opera' } // latest
    					]
    				}

        }

    };

};
