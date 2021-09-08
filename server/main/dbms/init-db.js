const debug = require('debug')('server:db')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')
const TABLE_SIMULATION = 'simulations'
const TABLE_OPTENV = 'optenv'

let database

let tableSimulation
let tableOptEnv
module.exports = {
  start ({ lowDBFile }) {
    console.log('*** lowDBFile:', lowDBFile)
    low(new FileAsync(lowDBFile))
      .then((db) => {
        debug('LowDB connected...')
        database = db
        if (!database.has(TABLE_SIMULATION).value()) {
          database.defaults({ simulations: [] }).write()
        }

        tableSimulation = database.get(TABLE_SIMULATION)
        tableOptEnv = database.get(TABLE_OPTENV)
      })
      .catch(err => debug('LowDB connection failed...', err.message))
  },
  getSimulations () {
    return tableSimulation
  },
  getOptEnvs () {
    return tableOptEnv
  }
}
