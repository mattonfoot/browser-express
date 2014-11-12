
var NavigationResponse = require('../../lib/navigation/navigationresponse').NavigationResponse;
var NavigationRequest = require('../../lib/navigation/navigationrequest').NavigationRequest;

exports = module.exports = request;

function request( method, app, url, headers, cb ) {
    if ( typeof cb !== 'function' ) {
        cb = headers;
        headers = {};
    }

    var options = requestOptions( url );
    options.method = method.toUpperCase();
    if ( headers.body ) {
        options.body = headers.body;
        delete headers.body;
    }
    options.headers = headers;

    var req = new NavigationRequest( options );

    var res = new NavigationResponse();

    res.addListener('finished', function() {
        if ( cb ) {
            cb( res, req );
        }
    })

    app( req, res );
}

request.get = function( app, url, headers, cb ) {
    request( 'get', app, url, headers, cb );
}

request.post = function( app, url, headers, cb ) {
    request( 'post', app, url, headers, cb );
}

request.options = function( app, url, headers, cb ) {
    request( 'options', app, url, headers, cb );
}

request.put = function( app, url, headers, cb ) {
    request( 'put', app, url, headers, cb );
}

request.del = function( app, url, headers, cb ) {
    request( 'delete', app, url, headers, cb );
}

request.head = function( app, url, headers, cb ) {
    request( 'head', app, url, headers, cb );
}

function requestOptions( href ) {
    var path = href;
    var hash = '';

    if ( path.indexOf('/') > 1 ) {
        path = path.split('/')[1];
    }

    if ( path.indexOf('#') >= 0 ) {
        var parts = path.split('#')[1];
        path = parts[ 0 ];
        hash = '#' + parts[ 1 ];
    }

    var options = {
        protocol: location.protocol.toString(),
        host: location.host.toString(),
        hostname: location.hostname.toString(),
        port: location.port.toString().toString(),
        path: path || '/',
        hash: hash,
        search: location.search.toString()
    };

    return options;
}
