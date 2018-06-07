const fs = require('fs');
const csv2 = require('csv2');
const agentParser = require('useragent');
const stream = require('stream')
const liner = new stream.Transform( { objectMode: false } )

liner._transform = function (chunk, encoding, done) {
  const data = chunk.toString()
  this.push(data.replace(/\",\"/g, '\"|\"'));
  done()
}

let totalProcessed = 0;
let failedDevice = 0;
let failedOS = 0;
let failedSource = 0;

const processData2 = (row) => {
  if (row[0] !== 'date') {
    const headers = row[2].split('|');
    const userAgent = headers.find(element => {
      return element.includes('user-agent');
    })
    if (userAgent) {
      const userAgentString = userAgent.split(':')[1];
      const agent = agentParser.parse(userAgentString);

      // console.log(JSON.stringify(agent));
      console.log(`source: ${agent.family}`);
      console.log(`os: ${agent.os.family}`);
      console.log(`device: ${agent.device.family}`);
      totalProcessed++;
      if (agent.family === 'Other') failedSource++;
      if (agent.os.family === 'Other') failedOS++;
      if (agent.device.family === 'Other') failedDevice++;
      /*
      if (agent.family === 'Other') {
        console.log(`full string: ${userAgentString}`);
      } else if (agent.family === 'Mobile Safari UI/WKWebView') {
        console.log(`full string: ${userAgentString}`);
      }
      */
    }

}
}

const processData = (row) => {
  if (row[0] !== 'date') {
    const headers = row[2].split('|');
    const userAgent = headers.find(element => {
      return element.includes('user-agent');
    }).split(':')[1];

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
        default:
          break;
      }
      // service check
      const noVersion = word.split('/')[0];
      switch (noVersion) {
        case 'python-requests':
          source = 'python-requests';
          break;
        case 'vlc':
          source = 'vlc';
          break;
      }
    }) 
  }
}

fs.createReadStream(__dirname + '/downloadRequests2.csv')
.pipe(liner)
  .pipe(csv2())
  .on('data', processData2)
  .on('end', () => {
    console.log(`total processed entries: ${totalProcessed}`);
    console.log(`failed to parse devices: ${failedDevice} success rate: ${(((totalProcessed - failedDevice) / totalProcessed) * 100).toFixed(3)}%`);
    console.log(`failed to parse source: ${failedSource} success rate: ${(((totalProcessed - failedSource) / totalProcessed) * 100).toFixed(3)}%`)
    console.log(`failed to parse OS: ${failedOS} success rate: ${(((totalProcessed - failedOS) / totalProcessed) * 100).toFixed(3)}%`)

  })