'use strict';

/**
 * Module dependencies.
 */
var escapeHtml = require('escape-html');

var defer = function( onerror, err, req, res ) {
    window.setTimeout(function() {
        onerror( err, req, res );
    }, 0);
};

/**
 * Module exports.
 */

module.exports = finalhandler

/**
 * Final handler:
 *
 * @param {Request} req
 * @param {Response} res
 * @param {Object} [options]
 * @return {Function}
 * @api public
 */

function finalhandler(req, res, options) {
  options = options || {}

  // get environment
  var env = options.env || window.env || 'development'

  // get error callback
  var onerror = options.onerror

  return function (err) {
    var msg

    // ignore 404 on in-flight response
    if (!err && res._header) {
  //  debug('cannot 404 after headers sent')
      return
    }

    // unhandled error
    if (err) {
      // default status code to 500
      if (!res.statusCode || res.statusCode < 400) {
        res.statusCode = 500
      }

      // respect err.status
      if (err.status) {
        res.statusCode = err.status
      }

      // production gets a basic error message
      var msg = env === 'production'
        ? http.STATUS_CODES[res.statusCode]
        : err.stack || err.toString()
      msg = escapeHtml(msg)
        .replace(/\n/g, '<br>')
        .replace(/  /g, ' &nbsp;') + '\n'
    } else {
      res.statusCode = 404
      msg = 'Cannot ' + escapeHtml(req.method) + ' ' + escapeHtml(req.originalUrl || req.url) + '\n'
    }

//  debug('default %s', res.statusCode)

    // schedule onerror callback
    if (err && onerror) {
      defer(onerror, err, req, res)
    }

    // cannot actually respond
    if (res._header) {
      return req.socket.destroy()
    }

    send(req, res, res.statusCode, msg)
  }
}

/**
 * Send response.
 *
 * @param {IncomingMessage} req
 * @param {OutgoingMessage} res
 * @param {number} status
 * @param {string} body
 * @api private
 */

function send(req, res, status, body) {
  function write() {
      res.statusCode = status

      // security header for content sniffing
      res.setHeader('X-Content-Type-Options', 'nosniff')

      // standard headers
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.setHeader('Content-Length', Buffer.byteLength(body, 'utf8'))

      if (req.method === 'HEAD') {
          res.end()
          return
      }

      res.end(body, 'utf8')
  }

  write();
}
