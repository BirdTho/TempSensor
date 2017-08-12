'use strict';

const cluster = require('cluster');



if (cluster.isMaster) {
  const sensorThread = cluster.fork();
  sensorThread.on('online', () => {
    sensorThread.send('sensor');
  });
  const dbThread = cluster.fork();
  dbThread.on('online', () => {
    dbThread.send('db');
  });

  const mainThread = require('./internal/mainThread');
  mainThread();
  process.on('unhandledRejection', (reason, p) =>
    logger.error('Unhandled Rejection at: Promise ', p, reason)
  );

} else {
  process.on('message', (message) => {
    if (message === 'sensor') {
      const sensorThread = require('./internal/sensorThread');
      sensorThread();
    } else if (message === 'db') {
      const dbThread = require('./internal/dbThread');
      const app = dbThread();

    }
  });
}
