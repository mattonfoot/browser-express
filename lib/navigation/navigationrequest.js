'use strict';

var util = require('util');

var defaultPort = 80;
var defaultHost = 'localhost';

function NavigationRequest( options ) {
    options = options || {};

    this.readable = true;
    this.domain = null;
    this.complete = false;
    this._headerNames = {};
    this.headers = {};
    this.statusCode = null;
    this.upgrade = false;

    this.httpVersionMajor = 1;
    this.httpVersionMinor = 1;
    this.httpVersion = this.httpVersionMajor + '.' + this.httpVersionMinor;

    this.url = options.path || '/';

    if ( options.path && / /.test( options.path ) ) {
        throw new TypeError('Request path contains unescaped characters.');
    }

    if ( options.headers ) {
        for ( var key in options.headers ) {
            this.setHeader( key, options.headers[ key ] );
        }
    }

    if (!this._headerNames.host) {
        var host = this.host = options.hostname || options.host || defaultHost;
        var port = this.port = options.port || defaultPort;

        this.setHeader( 'host', host + ':' + port );
    } else {
        var parts = (this.getHeader('host') || '').split(':');
        this.host = parts[ 0 ] || 'undefined';
        this.port = parts[ 1 ] || defaultPort;
    }

    this.hostname = this.host;

    var method = this.method = ( options.method || 'GET' ).toUpperCase();

    // this.params
    this.body = options.body;
    // this.query
}

exports.NavigationRequest = NavigationRequest;

NavigationRequest.prototype.setHeader = function (name, value) {
  if (arguments.length < 2) {
    throw new Error('`name` and `value` are required for setHeader().');
  }

  if (this._headerSent) {
    throw new Error('Can\'t set headers after they are sent.');
  }

  var key = name.toLowerCase();
  this.headers = this.headers || {};
  this.headers[key] = value;
  this._headerNames = this._headerNames || {};
  this._headerNames[key] = name;
};

NavigationRequest.prototype.getHeader = function (name) {
  if (arguments.length < 1) {
    throw new Error('`name` is required for getHeader().');
  }

  if (!this.headers) return;

  var key = name.toLowerCase();
  return this.headers[key];
};

NavigationRequest.prototype.removeHeader = function (name) {
  if (arguments.length < 1) {
    throw new Error('`name` is required for removeHeader().');
  }

  if (this._headerSent) {
    throw new Error('Can\'t remove headers after they are sent.');
  }

  if (!this.headers) return;

  var key = name.toLowerCase();
  delete this.headers[key];
  delete this._headerNames[key];
};
