/**
 * Module dependencies.
 */

var escapeHtml = require('escape-html');
var isAbsolute = require('./utils').isAbsolute;
var path = require('path');
var merge = require('utils-merge');
var sign = require('cookie-signature').sign;
var setCharset = require('./utils').setCharset;
var normalizeType = require('./utils').normalizeType;
var normalizeTypes = require('./utils').normalizeTypes;
var statusCodes = require('./status-codes');
var cookie = require('cookie');
var extname = path.extname;
var resolve = path.resolve;
var vary = require('vary');
var NavigationResponse = require('./navigation/navigationresponse').NavigationResponse;

var db = {
    "text/html": {
        "source": "iana",
        "compressible": true,
        "extensions": ["html","htm"]
    },
    "text/plain": {
        "source": "iana",
        "compressible": true,
        "extensions": ["txt","text","conf","def","list","log","in","ini"]
    },
    "application/javascript": {
      "source": "iana",
      "charset": "UTF-8",
      "compressible": true,
      "extensions": ["js"]
    },
    "application/json": {
        "source": "iana",
        "charset": "UTF-8",
        "compressible": true,
        "extensions": ["json","map"]
    },
    "application/xml": {
        "source": "iana",
        "compressible": true,
        "extensions": ["xml","xsl","xsd"]
    }
};

var mime = {

    types: {},

    extensions: {},

    lookup: function( string ) {
      if (!string || typeof string !== "string") return false;

      // remove any leading paths, though we should just use path.basename
      string = string.replace(/.*[\.\/\\]/, '').toLowerCase();

      if (!string) return false;

      return this.types[ string ] || false
    },

    charsets:{

        lookup: function (type) {
            var mime = db[ type ];

            if ( mime && mime.charset ) {
                return mime.charset;
            }

            // default text/* to utf-8
            if (/^text\//.test(type)) {
                return 'UTF-8';
            }

            return false;
        }

    }

};

Object.keys(db).forEach(function ( name ) {
    var entry = db[ name ];

    var exts = entry.extensions;

    if (!exts || !exts.length) {
        return
    }

    mime.extensions[ name ] = exts;

    exts.forEach(function (ext) {
        mime.types[ ext ] = name;
    })
})

/**
 * Response prototype.
 */

var res = module.exports = {
    __proto__: NavigationResponse.prototype
};

/**
 * Set status `code`.
 *
 * @param {Number} code
 * @return {NavigationResponse}
 * @api public
 */

res.status = function( code ) {
    this.statusCode = code;
    return this;
};

/**
 * Set Link header field with the given `links`.
 *
 * Examples:
 *
 *    res.links({
 *      next: 'http://api.example.com/users?page=2',
 *      last: 'http://api.example.com/users?page=5'
 *    });
 *
 * @param {Object} links
 * @return {NavigationResponse}
 * @api public
 */

res.links = function(links){
    var link = this.get('Link') || '';
    if (link) link += ', ';

    return this.set('Link', link + Object.keys(links).map(function(rel){
        return '<' + links[rel] + '>; rel="' + rel + '"';
    }).join(', '));
};

/**
 * Send a response.
 *
 * Examples:
 *
 *     res.send(new Buffer('wahoo'));
 *     res.send({ some: 'json' });
 *     res.send('<p>some html</p>');
 *
 * @param {string|number|boolean|object|Buffer} body
 * @api public
 */

res.send = function send(body) {
  var chunk = body;
  var encoding;
  var len;
  var req = this.req;
  var type;

  // settings
  var app = this.app;

  switch (typeof chunk) {
    // string defaulting to html
    case 'string':
      if (!this.get('Content-Type')) {
          this.type('text/html');
      }
      break;
    case 'boolean':
    case 'number':
    case 'object':
      if (chunk === null) {
        chunk = '';
      } else if (Buffer.isBuffer(chunk)) {
        if (!this.get('Content-Type')) {
            this.type('application/octet-stream');
        }
      } else {
        return this.json(chunk);
      }
      break;
  }

  // write strings in utf-8
  if (typeof chunk === 'string') {
    encoding = 'utf8';
    type = this.get('Content-Type');

    // reflect this in content-type
    if (typeof type === 'string') {
      this.set('Content-Type', setCharset(type, 'utf-8'));
    }
  }

  // populate Content-Length
  if (chunk !== undefined) {
    if (!Buffer.isBuffer(chunk)) {
      // convert chunk to Buffer; saves later double conversions
      chunk = new Buffer(chunk, encoding);
      encoding = undefined;
    }

    len = chunk.length;
    this.set('Content-Length', len);
  }

  // method check
  var isHead = req.method === 'HEAD';

  // ETag support
  if (len !== undefined && (isHead || req.method === 'GET')) {
    var etag = app.get('etag fn');
    if (etag && !this.get('ETag')) {
      etag = etag(chunk, encoding);
      etag && this.set('ETag', etag);
    }
  }

  // strip irrelevant headers
  if (204 == this.statusCode || 304 == this.statusCode) {
    this.removeHeader('Content-Type');
    this.removeHeader('Content-Length');
    this.removeHeader('Transfer-Encoding');
    chunk = '';
  }

  // skip body for HEAD
  if (isHead) {
    this.end();
  }

  // respond
  this.end(chunk, encoding);

  return this;
};

/**
 * Send JSON response.
 *
 * Examples:
 *
 *     res.json(null);
 *     res.json({ user: 'tj' });
 *
 * @param {string|number|boolean|object} obj
 * @api public
 */

res.json = function json(obj) {
  var val = obj;

  // settings
  var app = this.app;
  var replacer = app.get('json replacer');
  var spaces = app.get('json spaces');
  var body = JSON.stringify(val, replacer, spaces);

  // content-type
  if (!this.get('Content-Type')) {
    this.set('Content-Type', 'application/json');
  }

  return this.send(body);
};

/**
 * Send given HTTP status code.
 *
 * Sets the response status to `statusCode` and the body of the
 * response to the standard description from node's http.STATUS_CODES
 * or the statusCode number if no description.
 *
 * Examples:
 *
 *     res.sendStatus(200);
 *
 * @param {number} statusCode
 * @api public
 */

res.sendStatus = function sendStatus(statusCode) {
    var body = statusCodes[statusCode] || String(statusCode);

    this.statusCode = statusCode;
    this.type('text/plain');

    return this.send( body );
};

/**
 * Set _Content-Type_ response header with `type`.
 *
 * Examples:
 *
 *     res.type('application/json');
 *
 * @param {String} type
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.contentType =
res.type = function( type ){
  return this.set('Content-Type', ~type.indexOf('/')
    ? type
    : mime.lookup( type ) || 'application/octet-stream');
};

/**
 * Respond to the Acceptable formats using an `obj`
 * of mime-type callbacks.
 *
 * This method uses `req.accepted`, an array of
 * acceptable types ordered by their quality values.
 * When "Accept" is not present the _first_ callback
 * is invoked, otherwise the first match is used. When
 * no match is performed the server responds with
 * 406 "Not Acceptable".
 *
 * Content-Type is set for you, however if you choose
 * you may alter this within the callback using `res.type()`
 * or `res.set('Content-Type', ...)`.
 *
 *    res.format({
 *      'text/plain': function(){
 *        res.send('hey');
 *      },
 *
 *      'text/html': function(){
 *        res.send('<p>hey</p>');
 *      },
 *
 *      'appliation/json': function(){
 *        res.send({ message: 'hey' });
 *      }
 *    });
 *
 * In addition to canonicalized MIME types you may
 * also use extnames mapped to these types:
 *
 *    res.format({
 *      html: function(){
 *        res.send('<p>hey</p>');
 *      }
 *    });
 *
 * By default Express passes an `Error`
 * with a `.status` of 406 to `next(err)`
 * if a match is not made. If you provide
 * a `.default` callback it will be invoked
 * instead.
 *
 * @param {Object} obj
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.format = function( obj ) {
    var req = this.req;
    var next = req.next;

    var fn = obj.default;
    if (fn) delete obj.default;
    var keys = Object.keys( obj );

    var key = req.accepts( keys );

    this.vary("Accept");

    if ( key ) {
        this.set( 'Content-Type', normalizeType( key ).value );

        obj[ key ]( req, this, next );
    } else if ( fn ) {
        fn();
    } else {
        var err = new Error( 'Not Acceptable' );
        err.status = 406;
        err.types = normalizeTypes( keys ).map(function(o) {
            return o.value;
        });
        next( err );
    }

    return this;
};

/**
 * Set header `field` to `val`, or pass
 * an object of header fields.
 *
 * Examples:
 *
 *    res.set('Foo', ['bar', 'baz']);
 *    res.set('Accept', 'application/json');
 *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
 *
 * Aliased as `res.header()`.
 *
 * @param {String|Object|Array} field
 * @param {String} val
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.set =
res.header = function header(field, val) {
    if (arguments.length === 2) {
        if (Array.isArray(val)) {
            val = val.map(String);
        } else {
            val = String(val);
        }

        if ('content-type' == field.toLowerCase() && !/;\s*charset\s*=/.test( val )) {
            var charset = mime.charsets.lookup( val.split(';')[0] );
            if (charset) {
                val += '; charset=' + charset.toLowerCase();
            }
        }

        this.setHeader( field, val );
    } else {
        for (var key in field) {
            this.set(key, field[key]);
        }
    }

    return this;
};

/**
 * Get value for header `field`.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

res.get = function(field){
    return this.getHeader(field);
};

/**
 * Clear cookie `name`.
 *
 * @param {String} name
 * @param {Object} options
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.clearCookie = function(name, options){
    var opts = { expires: new Date(1), path: '/' };
    return this.cookie(name, '', options
      ? merge(opts, options)
      : opts);
};

/**
 * Set cookie `name` to `val`, with the given `options`.
 *
 * Options:
 *
 *    - `maxAge`   max-age in milliseconds, converted to `expires`
 *    - `signed`   sign the cookie
 *    - `path`     defaults to "/"
 *
 * Examples:
 *
 *    // "Remember Me" for 15 minutes
 *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
 *
 *    // save as above
 *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
 *
 * @param {String} name
 * @param {String|Object} val
 * @param {Options} options
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.cookie = function(name, val, options){
    options = merge({}, options);
    var secret = this.req.secret;
    var signed = options.signed;
    if (signed && !secret) throw new Error('cookieParser("secret") required for signed cookies');
    if ('number' == typeof val) val = val.toString();
    if ('object' == typeof val) val = 'j:' + JSON.stringify(val);
    if (signed) val = 's:' + sign(val, secret);
    if ('maxAge' in options) {
      options.expires = new Date(Date.now() + options.maxAge);
      options.maxAge /= 1000;
    }
    if (null == options.path) options.path = '/';
    var headerVal = cookie.serialize(name, String(val), options);

    // supports multiple 'res.cookie' calls by getting previous value
    var prev = this.get('Set-Cookie');
    if (prev) {
      if (Array.isArray(prev)) {
        headerVal = prev.concat(headerVal);
      } else {
        headerVal = [prev, headerVal];
      }
    }
    this.set('Set-Cookie', headerVal);
    return this;
};


/**
 * Set the location header to `url`.
 *
 * The given `url` can also be "back", which redirects
 * to the _Referrer_ or _Referer_ headers or "/".
 *
 * Examples:
 *
 *    res.location('/foo/bar').;
 *    res.location('http://example.com');
 *    res.location('../login');
 *
 * @param {String} url
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.location = function(url){
    var req = this.req;

    // "back" is an alias for the referrer
    if ('back' == url) url = req.get('Referrer') || '/';

    // Respond
    this.set('Location', url);
    return this;
};

/**
 * Redirect to the given `url` with optional response `status`
 * defaulting to 302.
 *
 * The resulting `url` is determined by `res.location()`, so
 * it will play nicely with mounted apps, relative paths,
 * `"back"` etc.
 *
 * Examples:
 *
 *    res.redirect('/foo/bar');
 *    res.redirect('http://example.com');
 *    res.redirect(301, 'http://example.com');
 *    res.redirect('../login'); // /blog/post/1 -> /blog/login
 *
 * @api public
 */

res.redirect = function redirect(url) {
    // handle redirects by doing the navigation

    var address = url;
    var body;
    var status = 302;

    // allow status / url
    if (arguments.length === 2) {
        if (typeof arguments[0] === 'number') {
            status = arguments[0];
            address = arguments[1];
        }
    }

    // Set location header
    this.location(address);
    address = this.get('Location');

    // Support text/{plain,html} by default
    this.format({
        text: function(){
            body = statusCodes[status] + '. Redirecting to ' + encodeURI(address);
        },

        html: function(){
            var u = escapeHtml(address);
            body = '<p>' + statusCodes[status] + '. Redirecting to <a href="' + u + '">' + u + '</a></p>';
        },

        default: function(){
            body = '';
        }
    });

    // Respond
    this.statusCode = status;
    this.set( 'Content-Length', Buffer.byteLength(body) );

    if (this.req.method === 'HEAD') {
        this.end();
    }

    this.end(body);
};

/**
 * Add `field` to Vary. If already present in the Vary set, then
 * this call is simply ignored.
 *
 * @param {Array|String} field
 * @return {NavigationResponse} for chaining
 * @api public
 */

res.vary = function(field){
    vary(this, field);

    return this;
};

/**
 * Render `view` with the given `options` and optional callback `fn`.
 * When a callback function is given a response will _not_ be made
 * automatically, otherwise a response of _200_ and _text/html_ is given.
 *
 * Options:
 *
 *  - `cache`     boolean hinting to the engine it should cache
 *  - `filename`  filename of the view being rendered
 *
 * @api public
 */

res.render = function( view, options, fn ){
    options = options || {};
    var self = this;
    var req = this.req;
    var app = req.app;

    // support callback function as second arg
    if ('function' == typeof options) {
        fn = options, options = {};
    }

    // merge res.locals
    options._locals = self.locals;

    // default callback to respond
    fn = fn || function( err, str ) {
        if (err) return req.next(err);
        self.send(str);
    };

    // render
    app.render( view, options, fn );
};
