/**
 * SALT-VIS configuration
 */
const base = '/home/ubuntu/uniq-simv2'
const cloudApiBase = 'http://180.210.14.16'
const dataApiBase = 'http://101.79.1.111:8080/restapi'


module.exports = {
  test: false,
  base,
  dockerBasePath: '/c' + base,
  saltPath: {
    home: base,
    // volume: base + '/data',
    volumeSim: '/c' + base,
    volumeOpt: '/c' + base + '/data',
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
    mongodbUrl: 'mongodb://localhost:27017/map',
    // mongodbUrl:
    //   'mongodb://1234:1234@localhost:27017/map?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false',
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
  },
  docker: {
    simulation: {
      images: {
        meso: [
          'images4uniq/salt:v2.1a.221019',
          'images4uniq/salt:v2.1a.20210915.test_BUS'
        ],
        micro: ['images4uniq/salt:v2.1a.20230228.test_mult_scale'],
        multi: ['images4uniq/salt:v2.1a.20230228.test_mult_scale']
      }
    },
    optimization: {
      images: [
        'images4uniq/optimizer:v3.0.20230814',
      ]
    }
  }
}
