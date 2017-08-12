'use strict';

module.exports = exports = () => {
  /* eslint-disable no-console */
  const logger = require('winston');
  const path = require('path');
  const favicon = require('serve-favicon');
  const compress = require('compression');
  const cors = require('cors');
  const helmet = require('helmet');
  const bodyParser = require('body-parser');

  const feathers = require('feathers');
  const configuration = require('feathers-configuration');
  const hooks = require('feathers-hooks');

  const handler = require('feathers-errors/handler');
  const notFound = require('feathers-errors/not-found');

  const middleware = require('../middleware');
  const services = require('../services');
  const appHooks = require('../app.hooks');

  const app = feathers();

// Load app configuration
  app.configure(configuration());
  console.log('Main Thread: ' + app.host + ':' + app.port);
// Enable CORS, security, compression, favicon and body parsing
  app.use(cors());
  app.use(helmet());
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
  app.use('/', feathers.static(app.get('public')));

// Set up Plugins and providers
  app.configure(hooks());

// Configure other middleware (see `middleware/index.js`)
  app.configure(middleware);
// Set up our services (see `services/index.js`)
  app.configure(services);
// Configure a middleware for 404s and the error handler
  app.use(notFound());
  app.use(handler());

  app.hooks(appHooks);

  const port = app.get('port');
  return app.listen(port).on('listening', () =>
    logger.info(`Feathers application started on ${app.get('host')}:${port}`)
  );
};
