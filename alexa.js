const request = require('request');
const unzip   = require('unzip');
const csv2    = require('csv2');
let counter = 0;
let max = 50;

const visitSite = (url) => {
  const destinationURL = url[1];
  counter++;
  if (counter > max) {
    console.log('maximum hit');
    return;
  }
  request.get(`https://stats.spexcast.com/track.mp3?target=${destinationURL}`, function (error, response, body){
    // console.log('statusCode:', response && response.statusCode);
    console.log(`statusCode: ${response && response.statusCode} visited: ${destinationURL}`)
  });
}

request.get('http://s3-us-west-1.amazonaws.com/umbrella-static/top-1m.csv.zip')
    .pipe(unzip.Parse())
    .on('entry', function (entry) {
        entry.pipe(csv2()).on('data', visitSite);
    })
;