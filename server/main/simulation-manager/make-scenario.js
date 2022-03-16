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

module.exports = ({ id, host, configuration: { begin, end, day, period, interval = 10 } }, type) => {
  console.log('type:', type)
  if (type === 'optimization') {
    return {
      scenario: {
        id,
        host,
        port: tcpPort,
        interval,
        time: {
          begin: 0,
          end: end - begin + 60
        },
        input: {
          fileType: 'SALT',
          node: 'doan.nod.xml',
          link: 'doan.edg.xml',
          connection: 'doan.con.xml',
          trafficLightSystem: 'doan_20210421.tss.xml',
          route: 'dj_doan_kaist_2h.rou.xml'
        },
        parameter: {
          minCellLength: 30.0,
          vehLength: 5.0
        },
        output: {
          // fileDir: `${output}/${id}/`,
          fileDir: 'output/',
          period,
          level: 'cell',
          save: 1
        }
      }
    }
  } else {
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
}
