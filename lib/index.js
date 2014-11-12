'use strict';

/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var mixin = require('merge-descriptors');
var proto = require('./application');
var req = require('./request');
var res = require('./response');
var Route = require('./router/route');
var Router = require('./router');

/**
 * Expose `createApplication()`.
 */
/*jshint -W120 */
exports = module.exports = createApplication;

/**
 * Create an express application.
 *
 * @return {Function}
 * @api public
 */

function createApplication() {
    var app = function( req, res, next ) {
        app.handle( req, res, next );
    };

    EventEmitter.call( app );

    mixin( app, proto );
    mixin( app, EventEmitter.prototype );

    app.request = { __proto__: req, app: app };
    app.response = { __proto__: res, app: app };

    app.init();

    return app;
}

/**
 * Expose the prototypes.
 */

exports.application = proto;
exports.request = req;
exports.response = res;

/**
 * Expose constructors.
 */

exports.Route = Route;
exports.Router = Router;
