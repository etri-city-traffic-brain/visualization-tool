/**
 * SALT-VIS configuration
 */
const base = '/home/ubuntu/salt';
// const cloudApiBase = 'http://118.130.73.9:9090';
const cloudApiBase = 'http://180.210.14.16';
// const dataApiBase = 'http://183.111.177.141:8080/rest.api';
// const dataApiBase = 'http://182.252.131.49:8080/rest.api';
const dataApiBase = 'http://101.79.1.111:8080/rest.api';
const predictionApiBase = 'http://localhost:999';
module.exports = {
  test: false,
  base,
  saltPath: {
    data: `${base}/data`,
    output: `${base}/output`,
    bin: `${base}/helper`,
  },
  salt: {
    config: `${base}/conf/salt.conf.json`,
    basePort: 3000,
    highestPort: 3100,
    python: 'python3',
    // standalone: `${base}/helper/runStandAloneSALT.py`,
    standalone: 'C:\\home\\ubuntu\\salt\\helpler\\runStandAloneSALT.py',
    distributed: `${base}/helper/runDistributedSALT.py`,
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
  predictionService: {
    urlBase: predictionApiBase,
  },
  server: {
    tcpPort: 1337,
    wsPort: 8082,
    webPort: 80,
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
    lowDBFile: './db.json',
  }
};
