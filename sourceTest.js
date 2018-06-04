const fs = require('fs');
const csv2 = require('csv2');

const stream = require('stream')
const liner = new stream.Transform( { objectMode: false } )

liner._transform = function (chunk, encoding, done) {
  var data = chunk.toString()
  var data2 = data.replace(/\",\"/g, '\"|\"');
  this.push(data2);
  /*
  if (this._lastLineData) data = this._lastLineData + data

  var lines = data.split('\n')
  this._lastLineData = lines.splice(lines.length-1,1)[0]

  const processedLines = [];
  lines.forEach(line => {
    processedLines.push(line)
  });

  processedLines.forEach(this.push.bind(this))
  */
  done()
}

const processData = (row) => {
  if (row[6] !== undefined) {
    console.log(row);
  }
}

/*
const requests = fs.createReadStream(__dirname + 'downloadRequests.csv')
requests.pipe()
    .on('entry', function (entry) {
        entry.pipe(csv2()).on('data', processData);
    })
;
*/

fs.createReadStream(__dirname + '/downloadRequests2.csv')
.pipe(liner)
  .pipe(csv2())
  .on('data', processData)