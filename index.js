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
  let deviceType = 'generic';
  let source = 'unknown';
  if (req.query.target) {
    if (req.headers['user-agent']) {
      const userAgent = req.headers['user-agent'];

      userAgent.toLowerCase().split(' ').map(word => {
        switch (word) {
          case 'windows':
            deviceType = 'computer';
            break;
          case 'android':
          case 'mobile':
            deviceType = 'phone';
            break;
          case 'google-podcast':
            source = 'google-podcast';
            break;
          case 'python-requests/2.11.1':
            source = 'python-requests';
            break;
          default:
            break;
        }
      })
      /*
        Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36,www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_003_MoonVMars.mp3
        Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36,www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_001_RocketReusability.mp3
        python-requests/2.11.1, www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_002a_GravitationalWaves.mp3
        python-requests/2.11.1, www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_003_MoonVMars.mp3
        python-requests/2.11.1, www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_002b_BraveNewWorld.mp3
        python-requests/2.11.1, www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_001_RocketReusability.mp3
        Mozilla/5.0 (compatible; Google-Podcast),www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_003_MoonVMars.mp3
        Mozilla/5.0 (compatible; Google-Podcast),www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_002b_BraveNewWorld.mp3
        Mozilla/5.0 (compatible; Google-Podcast),www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_002a_GravitationalWaves.mp3
        Mozilla/5.0 (compatible; Google-Podcast),www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_001_RocketReusability.mp3
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36
        undefined,www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_002b_BraveNewWorld.mp3
        "referer":"http://podbay.fm/show/1089397071/e/1456866000?autostart=1","accept-language":"en-US,en;q=0.9","cookie":"_ga=GA1.2.694423228.1524016133; _gid=GA1.2.100517705.1527046963","range":"bytes=0-","host":"stats.spexcast.com","x-forwarded-host":"stats.spexcast.com","x-forwarded-port":"443","x-forwarded-proto":"https","forwarded":"for=24.72.155.174;host=stats.spexcast.com;proto=https","x-forwarded-for":"24.72.155.174"},24.72.155.174,Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36
        undefined,www.podtrac.com/pts/redirect.mp3/www.csh.rit.edu/~tj/SPEXcast_002b_BraveNewWorld.mp3
        Mozilla/5.0 (Linux; Android 7.1.1; XT1650 Build/NCLS26.118-23-13-6-1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.158 Mobile Safari/537.36
        */    
    }
    influxClient.recordDownload(ipAddress, req.headers['user-agent'], req.query.target, req.headers, source, devicetype )
    console.log(`Incoming download recorded ipAddress: ${ipAddress} user-agent: ${req.headers['user-agent']} targetURL: ${req.query.target} source: ${source} deviceType: ${devicetype}`);
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
