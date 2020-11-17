/**
 * make simulation scenario file
 * author: beanpole
 */


const DAYS = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
  0: 'sun'
}

module.exports = ({ id, host, configuration: {begin, end, day, days, period, interval = 10}}) => {

  let routes = [`${DAYS[day]}.xml`]

  if (days > 1) {
    routes = new Array(days).fill('').map((v, i) => `${DAYS[(i + day) % 7]}.xml`)
  }

  return {
    scenario: {
      id,
      host,
      port: 1337,
      interval,
      time: {
        begin,
        end,
      },
      input:  {
        fileType: 'SALT',
        node: 'node.xml',
        link: 'edge.xml',
        connection: 'connection.xml',
        trafficLightSystem: 'tss.xml',
        // route: routes.map(route => `${route}`).join(' '),
        route: '/home/ubuntu/uniq-sim/routes/dj_sample_mon.rou.xml',
      },
      parameter: {
        minCellLength: 30.0,
        vehLength: 5.0,
      },
      output: {
        fileDir: `/home/ubuntu/uniq-sim/output/${id}/`,
        period,
        level: 'cell',
        save: 1,
      },
    },
  };
};
