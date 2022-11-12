const debug = require('debug')('server:db')
const low = require('lowdb')
const FileAsync = require('lowdb/adapters/FileAsync')

const TABLE_SIMULATION = 'simulations'
const TABLE_OPTENV = 'optenv'

let database, tableSimulation, tableOptEnv

module.exports = {
  start ({ lowDBFile }) {
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

        tableSimulation = database.get(TABLE_SIMULATION)
        tableOptEnv = database.get(TABLE_OPTENV)
        // console.log(tableOptEnv)
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
