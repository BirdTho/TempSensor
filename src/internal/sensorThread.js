'use strict';

module.exports = exports = () => {
  const sensor = require('node-dht-sensor');
  const Repeat = require('repeat');
  const rethinkdb = require('rethinkdbdash');
  const r = rethinkdb({
    db: 'time',
    pool: true,
  });

  function asSecond(time) {
    return Math.floor(time / 1000);
  }

  function isMinute(time) {
    return time % 60 === 0;
  }

  function isHour(time) {
    return time % 3600 === 0;
  }

  function isDay(time) {
    return time % 86400 === 0;
  }

  let entry;

  let lastSecond = asSecond(Date.now());
  let thisSecond;
  let time;

  function logSecond(timeInSeconds) {
    sensor.read(22, 21, function (err, temperature, humidity) {
      if (err) {
        console.error(err);
        process.exit(1);
      }

      entry = {
        time: new Date(timeInSeconds * 1000),
        minute: isMinute(timeInSeconds),
        hour: isHour(timeInSeconds),
        day: isDay(timeInSeconds),
        temp: temperature,
        humidity: humidity
      };

      lastSecond = thisSecond;

      r.table('time').insert(entry).run();
    });
  }

  Repeat(() => {
      time = Date.now();
      thisSecond = asSecond(time);
      if (thisSecond !== lastSecond) {
        logSecond(thisSecond);
      }
    }).every(200, 'ms').start.now();
};