const express = require('express');
require('dotenv').config();
const InfluxDBClient = require('./db');

const app = express();

const influxClient = new InfluxDBClient();

influxClient.connect();

console.log(`InfluxDB client connected: ${influxClient.connected}`)

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/track.mp3', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for']|| 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
  console.log(`request IP: ${ipAddress}`);
  if (req.query.target) {
    influxClient.recordDownload(ipAddress, req.headers['user-agent'], req.query.podcastURL, req.headers )
    console.log('Incoming download recorded');
    console.dir(req);
    return res.redirect(301, `https://${req.query.target}`);
  }
  console.log('invalid request');
  return res.status(400).send('invalid or no podcast URL provided');
});

if (process.env.EXPOSE_GLOBAL) {
  app.listen(process.env.PORT, '0.0.0.0', null, () => console.log(`SPEXcast Stats listening on public internet on port: ${process.env.PORT}`));
} else {
  app.listen(process.env.PORT, () => console.log(`SPEXcast Stats listening on port: ${process.env.PORT}`));

}
