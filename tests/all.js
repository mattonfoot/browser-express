require('./Route');
require('./Router');

require('./Application');
require('./Application.all');
require('./Application.del');
require('./Application.locals');
require('./Application.param');
require('./Application.request');
require('./Application.response');
require('./Application.route');
require('./Application.router');
require('./Application.routes.error');
require('./Application.use');

//  require('./Application.head');      // do we want to do head requests?
//  require('./Application.options');   // do we want to do option requests?

require('./Application.engine');
require('./Application.listen');
require('./Application.render');

require('./req.accepts');
require('./req.baseUrl');
require('./req.get');
require('./req.param');
require('./req.path');
require('./req.query');
require('./req.route');

// require('./req.protocol');           // we wouldn't be able to respond to another protocol anyway
require('./req.host');                  // we wouldn't be able to respond to different host anyway
require('./req.hostname');              // we wouldn't be able to respond to different host anyway
//  require('./req.subdomains');        // we wouldn't be able to respond to different host anyway

//  require('./res.format');
require('./res.get');
//  require('./res.json');
require('./res.links');
require('./res.locals');
require('./res.location');
require('./res.redirect');
require('./res.render');
require('./res.set');
require('./res.status');
require('./res.type');

require('./middleware.basic');
