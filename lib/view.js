/**
 * Module dependencies.
 */

var path = require('path');
var utils = require('./utils');

/**
 * Module variables.
 * @private
 */

var dirname = path.dirname;
var basename = path.basename;
var extname = path.extname;
var join = path.join;
var resolve = path.resolve;

/**
 * Expose `View`.
 */

module.exports = View;

/**
 * Initialize a new `View` with the given `name`.
 *
 * Options:
 *
 *   - `defaultEngine` the default template engine name
 *   - `engines` template engine require() cache
 *   - `root` root path for view lookup
 *
 * @param {String} name
 * @param {Object} options
 * @api private
 */

function View( name, options ) {
    options = options || {};
    this.name = name;
    this.root = options.root;
    var engines = options.engines;
    this.defaultEngine = options.defaultEngine;
    var ext = this.ext = extname( name );
    if (!ext && !this.defaultEngine) throw new Error('No default engine was specified and no extension was provided.');
    if (!ext) name += (ext = this.ext = ('.' != this.defaultEngine[ 0 ] ? '.' : '') + this.defaultEngine);
    this.engine = engines[ ext ] || ( engines[ ext ] = ( window[ ext.replace('.', '') ] || {} ).render );
    if (!this.engine) throw new Error('No engine has been configured for the extension \'' + ext + '\'');
    this.template = this.lookup( name );
}

/**
 * Lookup view by the given `name`
 *
 * @param {String} name
 * @return {String}
 * @api private
 */

View.prototype.lookup = function lookup( name ) {
    var path;
    var roots = [].concat( this.root );

//  debug('lookup "%s"', name);

    for (var i = 0; i < roots.length && !path; i++) {
        var root = roots[ i ];

        // resolve the path
        var loc = resolve( root, name );
        var namespace = dirname( loc );
        var file = basename( loc );

        // resolve the file
        path = this.resolve( namespace, file );
    }

    return path;
};

/**
 * Render with the given `options` and callback `fn(err, str)`.
 *
 * @param {Object} options
 * @param {Function} fn
 * @api private
 */

View.prototype.render = function render( options, fn ) {
//  debug('render "%s"', this.path);

    // TODO: need to pass the template not the file path?
    this.engine( this.template, options, fn );
};

/**
 * Resolve the file within the given directory.
 *
 * @param {string} namespace
 * @param {string} name
 * @private
 */

View.prototype.resolve = function resolve( namespace, name ) {
    var identifier = join( namespace, name );

    var scripts = document.getElementsByTagName( 'script' );
    for (var i = 0, len = scripts.length; i<len; i++) {
        if ( scripts[ i ].getAttribute( 'data-path' ) === identifier ) {
            return scripts[ i ].innerText;
        }
    }

    // throw error if not found?

    return undefined;
};
