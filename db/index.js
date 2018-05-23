const Influx = require('influx');

class InfluxDBClient {

  constructor(dbURL, dbPort) {
    this.dbURL = process.env.INFLUX_URL ? process.env.INFLUX_URL : dbURL;
    this.dbPort = Number.parseInt(process.env.INFLUX_PORT ? process.env.INFLUX_PORT : dbPort);
    this.connected = false;
    this.influx = null;
  }

  async connect() {
    const client = new Influx.InfluxDB({
      database: process.env.INFLUX_DB_NAME,
      host: this.dbURL,
      protocol: 'https',
      port: this.dbPort,
      username: process.env.INFLUX_USER,
      password: process.env.INFLUX_USER_PASSWORD,
      schema: [
        {
          measurement: 'requests',
          fields: {
            headers: Influx.FieldType.STRING,
          },
          tags: [
            'ipAddress',
            'referrer',
            'url',
            'source',
            'deviceType'
          ]
        }
      ]
    });
    this.connected = true;
    this.influx = client;
    return;
  }

  disconnect() {}

  async recordDownload(ipAddress, referrer, url, headers, source, deviceType) {
    this.influx.writePoints([
      {
        measurement: 'requests',
        fields: { headers: JSON.stringify(headers)},
        tags: {
          ipAddress,
          referrer,
          url,
          source,
          deviceType
        }
      }
    ])
  }

}

module.exports = InfluxDBClient;