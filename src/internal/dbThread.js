'use strict';
module.exports = exports = () => {
  const feathers = require('feathers');
  const rest = require('feathers-rest');
  const socketio = require('feathers-socketio');
  const configuration = require('feathers-configuration');
  const rethink = require('rethinkdbdash');
  const rethinkService = require('feathers-rethinkdb');
  const bodyParser = require('body-parser');
  const handler = require('feathers-errors/handler');

  const app = feathers();

  const r = rethink();

// Load app configuration
  app.configure(configuration());
  app.set('host', app.get('socketHost'));
  app.set('port', app.get('socketPort'));
  const port = app.get('port');

  console.log('DB Thread: ' + app.get('host') + ':' + port);
  app.configure(rest());
  app.configure(socketio());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(handler());

  // Start the server
  return app.listen(port);
};

// Getting temp by minutes
// r.db('time').table('time').orderBy({index: 'time'})
//   .filter(
//     r.row('minute').eq(true)
//       .and(r.row('time').ge(new Date(Date.now()-(20 * 60 * 1000)))))
//   .withFields('time', 'temp', 'humidity');
