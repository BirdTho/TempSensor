'use strict';

const cluster = require('cluster');

function getSecond() {
  return Math.floor(Date.now() / 1000);
}

function getMinute() {
  return Math.floor(Date.now() / 60000);
}

function getHour() {
  return Math.floor(Date.now() / 3600000);
}

global.secondEntries = [];
global.minuteEntries = [];
global.hourEntries = [];

if (cluster.isMaster) {
  const sensorDaemon = cluster.fork();

  sensorDaemon.on('message', (obj) => {
    console.log(
      'Time: ' + (new Date(obj.time).toTimeString()),
      'Temp: ' + ((obj.temp * 1.6) + 32).toFixed(1) + 'F',
      'Humidity: ' + obj.humidity.toFixed(1) + '%'
    );
  });

  // Do electron stuff here
} else {
  // Temp daemon code - fetch temp every second
  const sensor = require('node-dht-sensor');
  const Repeat = require('repeat');

  let entry;

  let lastSecond = getSecond();
  let lastMinute = getMinute();
  let lastHour = getHour();
  let thisSecond;
  let thisMinute;
  let thisHour;

  Repeat(() => {
    thisSecond = getSecond();
    if (thisSecond !== lastSecond) {
      (function (timeInSeconds) {
        sensor.read(22, 21, function (err, temperature, humidity) {
          if (err) {
            console.error(err);
            process.exit(1);
          }

          // TODO: Figure out how to collate past minute's
          // TODO: data, hour's data then push the new time
          entry = {
            time: timeInSeconds * 1000,
            second: timeInSeconds,
            temp: temperature,
            humidity: humidity
          };

          global.secondEntries.push(entry);

          thisMinute = getMinute();
          thisHour = getHour();

          // collate last minute
          if (thisMinute !== lastMinute) {

            let sumTemp = 0;
            let sumHumidity = 0;
            let total = global.secondEntries.length;
            global.secondEntries.forEach(record => {
              sumTemp += record.temp;
              sumHumidity += record.humidity;
            });
            entry.minute = lastMinute;
            entry.avgTempMinute = sumTemp / total;
            entry.avgHumidityMinute = sumHumidity / total;

            global.minuteEntries.push(entry);

            lastMinute = thisMinute;

            if (thisHour !== lastHour) {
              let sumTemp = 0;
              let sumHumidity = 0;
              let total = global.minuteEntries.length;

            }
          }

          lastSecond = thisSecond;

          process.send(entry);
        });
      })(thisSecond)
    }
  }).every(200, 'ms').start.now();
}