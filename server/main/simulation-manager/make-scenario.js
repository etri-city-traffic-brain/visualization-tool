/**
 * make simulation scenario file
 * author: beanpole
 */

const { config } = require('../../globals')

// const { output } = config.saltPath

const { routePerDay } = config.simulation
const { tcpPort } = config.server

const getRouteFor = day => {
  const route = routePerDay[day] || routePerDay[routePerDay.length - 1]
  // return `${routes}/${route}`
  return `../../routes/${route}`
}

const getRouteForSim = region => {
  const simRouteDir = '/uniq/simulator/salt/volume/data/route_sim'
  if (!region) {
    return `${simRouteDir}/dj.rou.xml` // 대전전체
  }
  return `${simRouteDir}/${region}.rou.xml`
}

module.exports = (
  {
    id,
    host,
    configuration: { begin, end, day, period, interval = 10, region }
  },
  type
) => {

  return {
    scenario: {
      id,
      host,
      port: tcpPort,
      interval,
      time: {
        begin,
        end
      },
      input: {
        fileType: 'SALT',
        node: 'node.xml',
        link: 'edge.xml',
        connection: 'connection.xml',
        trafficLightSystem: 'tss.xml',
        multiarea: 'multiarea/edge.xml',
        // route: getRouteFor(day)
        route: getRouteForSim(region)
      },
      parameter: {
        minCellLength: 30.0,
        vehLength: 5.0
      },
      output: {
        // fileDir: `${output}/${id}/`,
        fileDir: `/uniq/simulator/salt/volume/sim/${id}/output`,
        period,
        level: 'cell',
        save: 1
      }
    }
  }
}
