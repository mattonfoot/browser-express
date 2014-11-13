Browser Express
===============

Fast, unopinionated, minimalist web framework for web browsers.

[ ![Codeship Status for mattonfoot/browser-express](https://codeship.com/projects/785abfc0-4cb8-0132-e4eb-22cd93d2d61d/status)](https://codeship.com/projects/47207)
[ ![Sauce Test Status for mattonfoot/browser-express](https://saucelabs.com/buildstatus/mattonfoot)](https://saucelabs.com/u/mattonfoot)
  
[ ![Sauce Test Status for mattonfoot/browser-express](https://saucelabs.com/browser-matrix/mattonfoot.svg)](https://saucelabs.com/u/mattonfoot)

```js
var express = require('browser-express');
var app = express();

app.get( '/', function ( req, res ) {
  res.send( 'Hello World' );
});

app.listen();
```

### Installation

```bash
$ npm install browser-express --save
```

## Features

  * Robust routing
  * Focus on high performance
  * Super-high test coverage
  * HTTP helpers (redirection, caching, etc) -- ( maybe not )
  * View system supporting 14+ template engines -- ( maybe not )
  * Content negotiation -- ( maybe not )
  * Executable for generating applications quickly -- ( not yet )

## Philosophy

  The Express philosophy is to provide small, robust tooling for HTTP servers, making
  it a great solution for single page applications, web sites, hybrids, or public
  HTTP APIs.

  Express does not force you to use any specific ORM or template engine. With support for over
  14 template engines via [Consolidate.js](https://github.com/tj/consolidate.js),
  you can quickly craft your perfect framework.

## Tests

  To run the test suite, first install the dependancies, then run `npm test`:

```bash
$ npm install
$ npm test
```

### License

  [MIT](LICENSE)



[npm-image]: https://img.shields.io/npm/v/express.svg?style=flat
[npm-url]: https://npmjs.org/package/express
[downloads-image]: https://img.shields.io/npm/dm/express.svg?style=flat
[downloads-url]: https://npmjs.org/package/express
[travis-image]: https://img.shields.io/travis/strongloop/express.svg?style=flat
[travis-url]: https://travis-ci.org/strongloop/express
[coveralls-image]: https://img.shields.io/coveralls/strongloop/express.svg?style=flat
[coveralls-url]: https://coveralls.io/r/strongloop/express?branch=master
[gratipay-image-visionmedia]: https://img.shields.io/gratipay/visionmedia.svg?style=flat
[gratipay-url-visionmedia]: https://gratipay/visionmedia/
[gratipay-image-dougwilson]: https://img.shields.io/gratipay/dougwilson.svg?style=flat
[gratipay-url-dougwilson]: https://gratipay/dougwilson/
