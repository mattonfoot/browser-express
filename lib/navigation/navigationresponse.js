'use strict';

var events = require('events');
var util = require('util');

var defaultPort = 80;
var defaultHost = 'localhost';

function NavigationResponse() {
    this.domain = null;
    this.writable = true;
    this.sendDate = true;

    this._headerSent = false;
    this._headerNames = {};
    this.headers = {};

    this._hasBody = true;
    this.body = '';
    this.text;
    this.data;

    this.trailers = '';

    this.finished = false;

    this.statusCode = 200;
    this.statusMessage = null;
}

util.inherits( NavigationResponse, events.EventEmitter );

exports.NavigationResponse = NavigationResponse;

NavigationResponse.prototype.setHeader = function (name, value) {
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

NavigationResponse.prototype.getHeader = function (name) {
  if (arguments.length < 1) {
    throw new Error('`name` is required for getHeader().');
  }

  if (!this.headers) return;

  var key = name.toLowerCase();
  return this.headers[key];
};

NavigationResponse.prototype.removeHeader = function (name) {
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

NavigationResponse.prototype.write = function ( chunk, encoding ) {
  if ( !this._hasBody ) {
      return true;
  }

  if ( typeof chunk !== 'string' && !Buffer.isBuffer(chunk) ) {
      throw new TypeError( 'first argument must be a string or Buffer' );
  }

  if ( chunk.length === 0 ) {
      return true;
  }

  this.body += chunk.toString( encoding );

  return this;
};

NavigationResponse.prototype.addTrailers = function ( headers ) {
    this.trailers = headers;
};

NavigationResponse.prototype.end = function ( data, encoding ) {
    if ( this.finished ) {
        return false;
    }

    if ( data && !this._hasBody ) {
        data = false;
    }

    if ( data ) {
        this.write( data, encoding );
    }

    this.text = this.body;
    try {
        this.data = JSON.parse( this.body );
    } catch( err ) {
    }

    this.emit( 'end' );

    this.finished = true;

    this.emit( 'finished' );

    return this;
};
