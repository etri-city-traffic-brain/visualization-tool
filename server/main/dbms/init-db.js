const debug = require('debug')('server:db')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const TABLE_SIMULATION = 'simulations'
const TABLE_OPTENV = 'optenv'
const TABLE_ROUTE = 'routes'

let database, tableSimulation, tableOptEnv, tableRoute

module.exports = {
  start({ lowDBFile }) {
    low(new FileAsync(lowDBFile))
      .then(db => {
        debug('LowDB connected...')
        database = db
        if (!database.has(TABLE_SIMULATION).value()) {
          database.defaults({ simulations: [] }).write()
        }
        if (!database.has(TABLE_OPTENV).value()) {
          database.defaults({ optenv: [] }).write()
        }
        if (!database.has(TABLE_ROUTE).value()) {
          database.defaults({ routes: [] }).write()
        }

        tableSimulation = database.get(TABLE_SIMULATION)
        tableOptEnv = database.get(TABLE_OPTENV)
        tableRoute = database.get(TABLE_ROUTE)
        // console.log(tableOptEnv)
      })
      .catch(err => debug('LowDB connection failed...', err.message))
  },
  getSimulations() {
    return tableSimulation
  },
  getOptEnvs() {
    return tableOptEnv
  },
  getRoutes() {
    return tableRoute
  }
}
