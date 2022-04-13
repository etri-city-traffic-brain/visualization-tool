/**
 * SALT-VIS configuration
 */
const base = '/home/ubuntu/uniq-sim'
const cloudApiBase = 'http://180.210.14.16'
const dataApiBase = 'http://101.79.1.111:8080/rest.api'

module.exports = {
  test: false,
  base,
  saltPath: {
    home: base,
    volume: '/c/home/ubuntu/uniq-sim/data',
    volumeSim: '/c/home/ubuntu/uniq-sim',
    data: `${base}/data`,
    output: `${base}/output`,
    scripts: `${base}/scripts`
  },
  salt: {
    config: `${base}/conf/salt.conf.json`,
    basePort: 3000,
    highestPort: 3100,
    python: 'python3'
  },
  simulation: {
    routes: `${base}/routes`,
    routePerDay: [
      'dj_sample_sun.rou.xml',
      'dj_sample_mon.rou.xml',
      'dj_sample_tue.rou.xml',
      'dj_sample_wed.rou.xml',
      'dj_sample_thu.rou.xml',
      'dj_sample_fri.rou.xml',
      'dj_sample_sat.rou.xml',
      'dj_sample_test.rou.xml'
    ]
  },
  scenarioService: {
    urlBaseForScenarioByRegion: `${dataApiBase}/ScenarioByRegion`,
    urlBaseForScenarioByCoordinate: `${dataApiBase}/ScenarioByCoordinate`
  },
  signalService: {
    urlBase: dataApiBase
  },
  cloudService: {
    urlBase: cloudApiBase
  },
  server: {
    ip: '192.168.1.223',
    tcpPort: process.env.tcpPort || 1337,
    wsPort: 8082,
    webPort: process.env.webPort || 8080
  },
  db: {
    // mongodbUrl: 'mongodb://1234:1234@localhost:27017/map',
    mongodbUrl:
      'mongodb://1234:1234@localhost:27017/map?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
    mongoOption: {
      useNewUrlParser: true,
      //  autoReconnect: true,
      // reconnectTries: Number.MAX_VALUE,
      // reconnectInterval: 1000,
      keepAlive: 1,
      connectTimeoutMS: 30000,
      useUnifiedTopology: true
    },
    lowDBFile: process.env.db || './db.json'
  }
}
