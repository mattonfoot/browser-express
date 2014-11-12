'use strict';

/*
 *  navigation.Navigator();
 *
 *  events:
 *    ready
 *    navigate
 *    stop
 *
 */

var events = require('events');
var util = require('util');
var NavigationRequest = require('./navigationrequest').NavigationRequest;
var NavigationResponse = require('./navigationresponse').NavigationResponse;

// private
var isBrowser = typeof window !== "undefined" && window.document;
var isPageLoaded = !isBrowser;

/**
 * Sets the page as loaded.
 */
function pageLoaded( app ) {
    return function() {
        window.setTimeout(function() {
            if ( !isPageLoaded ) {
                isPageLoaded = true;

                loadedListener( app );
            }
        }, 0);
    };
}

function findBestTarget( tagName, ev ) {
    var target = ev.target || ev.srcElement;
    var nodeName = target.nodeName.toUpperCase();

    while ( !!target && nodeName !== tagName ) {
        target = target.parentNode;
        if (target) {
            nodeName = target.nodeName.toUpperCase();
        }
    }

    if ( !target ) return;

    return target;
}
// private

function Navigator( navigationListener ) {
    if ( !(this instanceof Navigator) ) {
        return new Navigator( navigationListener );
    }

    events.EventEmitter.call(this);

    var self = this;

    // TODO: wrap listener to handle redirects from the navigationListener
    // and handle successful repsonses with body content
    if ( navigationListener ) {
        this.addListener( 'navigate', navigationListener );
    }
}

util.inherits( Navigator, events.EventEmitter );

exports.Navigator = Navigator;

if (window) {
    window.navigation = module.exports;
}


Navigator.prototype.listen = function( readyListener ) {
    if ( readyListener ) {
        this.addListener( 'ready', readyListener);
    }

    var callback = pageLoaded( this );

    if ( isPageLoaded ) {
        callback();
        return;
    }

    if ( document.addEventListener ) {
        // cordova device
        document.addEventListener( "deviceready", callback, false );

        // standards compliant browser
        document.addEventListener( "DOMContentLoaded", callback, false );
        window.addEventListener( "load", callback, false );
    }

    if ( document.readyState === "complete" ) {
        callback();
    }

    return this;
};

Navigator.prototype.stop = function( cb ) {
  if ( cb ) {
      this.once( 'stop', cb );
  }

  this.emit( 'stop' );

  return this;
};

Navigator.prototype.pushState = function( url, method, data ) {
    var options = requestOptions( url );
    options.method = method;
    options.data = data;

    var req = new NavigationRequest( options );

    history.pushState( req, null, req.url );

    this.popState( req );
}

Navigator.prototype.replaceState = function( url, method, data ) {
    var options = requestOptions( url );
    options.method = method;
    options.data = data;

    var req = new NavigationRequest( options );

    history.replaceState( req, null, req.url );

    this.popState( req );
}

Navigator.prototype.popState = function( req ) {
    var res = new NavigationResponse( req );

    this.emit( 'navigate', req, res );
}

/*
 * private API
 */
var history = window.history;
function loadedListener( app ) {
    if ( !(history && history.pushState) ) {
        throw new Error( 'Environment does not support the History API' );
    }

    app.replaceState( window.location.href, 'GET' );

    if ( document.addEventListener ) {

        // setup delegated anchor tag listener
        document.addEventListener( 'click', function( ev ) {
            var target = findBestTarget( 'A', ev );

            if (!target) return;

            // ignore external links
            // ignore # links on the same page

            ev.preventDefault();

            app.pushState( target.href, 'GET' );
        }, true );

        // setup delegated form submit listener
        document.addEventListener( 'submit', function( ev ) {
            var target = findBestTarget( 'FORM', ev );

            if (!target) return;

            ev.preventDefault();

            var method = target.method;
            app.pushState( target.action, method /*, toData( target ) */ );
        }, true );

        // setup history API listener
        window.addEventListener( "popstate", function( ev ) {
            app.popState( ev.state );
        }, false );

    }

    app.emit( 'ready' );
}

function requestOptions( href ) {
    var hash = '';
    var search = 1 + href.indexOf('?');
    var pathlength = search ? search - 1 : href.length;
    var fqdn = 1 + href.substr(0, pathlength).indexOf('://');
    var protohost = fqdn ? href.substr(0, href.indexOf('/', 2 + fqdn)) : '';
    var path = href.substr( protohost.length );

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
