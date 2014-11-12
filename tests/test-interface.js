var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
    console.log( request );

    console.log( '=======' );

    console.log( response );

    console.log( '=======' );

    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("Hello World\n");
});

// Listen on port 9005, IP defaults to 127.0.0.1
server.listen( 9005 );

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:9005/");
