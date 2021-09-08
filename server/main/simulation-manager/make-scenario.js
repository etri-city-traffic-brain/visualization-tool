/**
 * make simulation scenario file
 * author: beanpole
 */

const { config } = require('../../globals')

// const { output } = config.saltPath

const { routePerDay } = config.simulation
const { tcpPort } = config.server

const getRouteFor = (day) => {
  const route = routePerDay[day] || routePerDay[routePerDay.length - 1]
  // return `${routes}/${route}`
  return `../../routes/${route}`
}

const output = '/uniq/simulator/salt/volume/output'

module.exports = ({ id, host, configuration: { begin, end, day, period, interval = 10 } }) => {
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
        route: getRouteFor(day)
      },
      parameter: {
        minCellLength: 30.0,
        vehLength: 5.0
      },
      output: {
        fileDir: `${output}/${id}/`,
        period,
        level: 'cell',
        save: 1
      }
    }
  }
}
