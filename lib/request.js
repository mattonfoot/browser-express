/**
 * Module dependencies.
 */

var isIP = require('isip').test;
var parse = require('parseurl');
var proxyaddr = require('proxy-addr');
var NavigationRequest = require('./navigation/navigationrequest').NavigationRequest;
var slice = Array.prototype.slice;

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

    extensions: {

    },

    lookup: function( string ) {
      if (!string || typeof string !== "string") return false;

      // remove any leading paths, though we should just use path.basename
      string = string.replace(/.*[\.\/\\]/, '').toLowerCase();

      if (!string) return false;

      return this.types[ string ] || false
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
 * Request prototype.
 */

var req = exports = module.exports = {
    __proto__: NavigationRequest.prototype
};

req.accepts = function( types ) {
    if ( !Array.isArray( types ) ) {
        types = slice.call( arguments );
    }

    if ( !types.length ) {
        return preferredMediaTypes();
    }

    if ( !this.headers.accept ) {
        return types[0];
    }

    var mimes = types.map( extToMime );
    var accepts = preferredMediaTypes( this.headers.accept, mimes.filter( validMime ) );
    var first = accepts[0];

    if ( !first ) {
        return false;
    }
    return types[ mimes.indexOf( first ) ];
}

/**
 * Return request header.
 *
 * The `Referrer` header field is special-cased,
 * both `Referrer` and `Referer` are interchangeable.
 *
 * Examples:
 *
 *     req.get('Content-Type');
 *     // => "text/plain"
 *
 *     req.get('content-type');
 *     // => "text/plain"
 *
 *     req.get('Something');
 *     // => undefined
 *
 * Aliased as `req.header()`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

req.get =
req.header = function(name){
    switch (name = name.toLowerCase()) {
        case 'referer':
        case 'referrer':
            return this.headers.referrer || this.headers.referer;
        default:
            return this.headers[ name ];
    }
};

/**
 * Return the value of param `name` when present or `defaultValue`.
 *
 *  - Checks route placeholders, ex: _/user/:id_
 *  - Checks body params, ex: id=12, {"id":12}
 *  - Checks query string params, ex: ?id=12
 *
 * To utilize request bodies, `req.body`
 * should be an object. This can be done by using
 * the `bodyParser()` middleware.
 *
 * @param {String} name
 * @param {Mixed} [defaultValue]
 * @return {String}
 * @api public
 */

req.param = function(name, defaultValue){
    var params = this.params || {};
    var body = this.body || {};
    var query = this.query || {};
    if (null != params[name] && params.hasOwnProperty(name)) return params[name];
    if (null != body[name]) return body[name];
    if (null != query[name]) return query[name];
    return defaultValue;
};

/**
 * Return http
 *
 * @return {String}
 * @api public
 */

defineGetter(req, 'protocol', function protocol(){
    return 'http';
});

/**
 * Return subdomains as an array.
 *
 * Subdomains are the dot-separated parts of the host before the main domain of
 * the app. By default, the domain of the app is assumed to be the last two
 * parts of the host. This can be changed by setting "subdomain offset".
 *
 * For example, if the domain is "tobi.ferrets.example.com":
 * If "subdomain offset" is not set, req.subdomains is `["ferrets", "tobi"]`.
 * If "subdomain offset" is 3, req.subdomains is `["tobi"]`.
 *
 * @return {Array}
 * @api public
 */

defineGetter(req, 'subdomains', function subdomains() {
    var hostname = this.hostname;

    if (!hostname) return [];

    var offset = this.app.get('subdomain offset');
    var subdomains = !isIP( hostname )
      ? hostname.split( '.' ).reverse()
      : [ hostname ];

    return subdomains.slice( offset );
});

/**
 * Short-hand for `url.parse(req.url).pathname`.
 *
 * @return {String}
 * @api public
 */

defineGetter(req, 'path', function path() {
    return parse( this ).pathname;
});

/**
 * Parse the "Host" header field to a hostname.
 *
 * When the "trust proxy" setting trusts the socket
 * address, the "X-Forwarded-Host" header field will
 * be trusted.
 *
 * @return {String}
 * @api public
 */

defineGetter(req, 'hostname', function hostname(){
    var host = this.get('X-Forwarded-Host');

    if (!host) {
      host = this.get('Host');
    }

    if (!host) return;

    return host;
});

/**
 * Helper function for creating a getter on an object.
 *
 * @param {Object} obj
 * @param {String} name
 * @param {Function} getter
 * @api private
 */
function defineGetter(obj, name, getter) {
    Object.defineProperty(obj, name, {
        configurable: true,
        enumerable: true,
        get: getter
    });
};













function extToMime( type ) {
  if ( ~type.indexOf('/') ) {
      return type;
  }

  return mime.lookup( type );
}

function validMime( type ) {
    return typeof type === 'string';
}

function parseAccept( accept ) {
  return accept.split(',').map(function(e, i) {
    return parseMediaType(e.trim(), i);
  }).filter(function(e) {
    return e;
  });
};

function parseMediaType(s, i) {
  var match = s.match(/\s*(\S+?)\/([^;\s]+)\s*(?:;(.*))?/);
  if (!match) return null;

  var type = match[1],
      subtype = match[2],
      full = "" + type + "/" + subtype,
      params = {},
      q = 1;

  if (match[3]) {
    params = match[3].split(';').map(function(s) {
      return s.trim().split('=');
    }).reduce(function (set, p) {
      set[p[0]] = p[1];
      return set
    }, params);

    if (params.q != null) {
      q = parseFloat(params.q);
      delete params.q;
    }
  }

  return {
    type: type,
    subtype: subtype,
    params: params,
    q: q,
    i: i,
    full: full
  };
}

function getMediaTypePriority(type, accepted) {
  return (accepted.map(function(a) {
    return specify(type, a);
  }).filter(Boolean).sort(function (a, b) {
    if(a.s == b.s) {
      return a.q > b.q ? -1 : 1;
    } else {
      return a.s > b.s ? -1 : 1;
    }
  })[0] || {s: 0, q: 0});
}

function specify(type, spec) {
  var p = parseMediaType(type);
  var s = 0;

  if (!p) {
    return null;
  }

  if(spec.type.toLowerCase() == p.type.toLowerCase()) {
    s |= 4
  } else if(spec.type != '*') {
    return null;
  }

  if(spec.subtype.toLowerCase() == p.subtype.toLowerCase()) {
    s |= 2
  } else if(spec.subtype != '*') {
    return null;
  }

  var keys = Object.keys(spec.params);
  if (keys.length > 0) {
    if (keys.every(function (k) {
      return spec.params[k] == '*' || (spec.params[k] || '').toLowerCase() == (p.params[k] || '').toLowerCase();
    })) {
      s |= 1
    } else {
      return null
    }
  }

  return {
    q: spec.q,
    s: s,
  }

}

function preferredMediaTypes( accept, provided ) {
  // RFC 2616 sec 14.2: no header = */*
  accept = parseAccept( accept === undefined ? '*/*' : accept || '' );
  if (provided) {
    return provided.map(function(type) {
      return [type, getMediaTypePriority(type, accept)];
    }).filter(function(pair) {
      return pair[1].q > 0;
    }).sort(function(a, b) {
      var pa = a[1];
      var pb = b[1];
      return (pb.q - pa.q) || (pb.s - pa.s) || (pa.i - pb.i);
    }).map(function(pair) {
      return pair[0];
    });

  } else {
    return accept.sort(function (a, b) { // revsort
      return (b.q - a.q) || (a.i - b.i);
    }).filter(function( type ) {
      return type.q > 0;
    }).map(function( type ) {
      return type.full;
    });
  }
}
