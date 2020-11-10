/**
 * SALT-VIS configuration
 */
const base = '/home/ubuntu/uniq-sim';
const cloudApiBase = 'http://180.210.14.16';
const dataApiBase = 'http://101.79.1.111:8080/rest.api';

module.exports = {
  test: false,
  base,
  saltPath: {
    home: base,
    data: `${base}/data`,
    output: `${base}/output`,
    script: `${base}/script`,
  },
  salt: {
    config: `${base}/conf/salt.conf.json`,
    basePort: 3000,
    highestPort: 3100,
    python: 'python3',
  },
  simulation: {
    // dbFile: './db.json', // database file location
    routes: `${base}/routes`,
    routePerDay: [
      'gd_trips_2017_sun_refinement.rou.xml',
      'gd_trips_2017_mon_refinement.rou.xml',
      'gd_trips_2017_tue_refinement.rou.xml',
      'gd_trips_2017_wed_refinement.rou.xml',
      'gd_trips_2017_thu_refinement.rou.xml',
      'gd_trips_2017_fri_refinement.rou.xml',
      'gd_trips_2017_sat_refinement.rou.xml',
    ],
  },
  scenarioService: {
    urlBaseForScenarioByRegion: `${dataApiBase}/ScenarioByRegion`,
    urlBaseForScenarioByCoordinate: `${dataApiBase}/ScenarioByCoordinate`,
  },
  signalService: {
    urlBase: dataApiBase,
  },
  cloudService: {
    urlBase: cloudApiBase,
  },
  // predictionService: {
  //   urlBase: predictionApiBase,
  // },
  server: {
    ip: '127.0.0.1',
    tcpPort: process.env['tcpPort'] || 1337,
    wsPort: 8082,
    webPort: process.env['webPort'] || 8080,
  },
  db: {
    mongodbUrl: 'mongodb://127.0.0.1:27017/map',
    mongoOption: {
      useNewUrlParser: true,
      autoReconnect: true,
      reconnectTries: Number.MAX_VALUE,
      reconnectInterval: 1000,
      keepAlive: 1,
      connectTimeoutMS: 30000,
    },
    lowDBFile: process.env['db'] || './db.json',
  }
};
