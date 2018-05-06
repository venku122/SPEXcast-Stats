const express = require('express');
require('dotenv').config();

const app = express();

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/track.mp3', (req, res) => {
  console.log('Incoming download recorded');
  console.dir(req);
  const ip = req.headers['x-forwarded-for']|| 
         req.connection.remoteAddress || 
         req.socket.remoteAddress || 
         req.connection.socket.remoteAddress;
  console.log(`request IP: ${ip}`);
  if (req.query.podcastURL) {
    return res.redirect(301, `https://${req.query.podcastURL}`);
  }
  return res.status(400).send('invalid or no podcast URL provided');
});

if (process.env.EXPOSE_GLOBAL) {
  app.listen(process.env.PORT, '0.0.0.0', null, () => console.log(`SPEXcast Stats listening on public internet on port: ${process.env.PORT}`));
} else {
  app.listen(process.env.PORT, () => console.log(`SPEXcast Stats listening on port: ${process.env.PORT}`));

}
