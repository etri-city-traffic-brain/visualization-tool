
const debug = require('debug')('api:create');

const { updateStatus, currentTimeFormatted, getSimulations } = require('../../globals');
const { executeSimulation } = require('../../sim-runner');
const { config } = require('../../globals')

const fs = require('fs')


const { scripts } = config.saltPath
/**
 * Start a simulation
 */
async function start(req, res) {
  // fs.readdir
  try {
    const list = fs.readdirSync(scripts)
    console.log(list)
    res.send(list)
  } catch (err)
  {
    console.log('**** err', err.message)
  }
}

module.exports = start;
