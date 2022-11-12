const { dockerCommand } = require('docker-cli-js')

const {
  updateStatus,
  currentTimeFormatted,
  getSimulation
} = require('../../globals')

module.exports = async (req, res, next) => {
  const { id, type } = req.query

  const sim = getSimulation(id)

  if (type === 'slave') {
    for (const slaveId of sim.slaves) {
      const cmd = ['stop', slaveId]
      await dockerCommand(cmd.join(' '))
        .then(() => {})
        .catch(() => {})
    }
    updateStatus(id, 'stopped', { started: currentTimeFormatted() })
    res.send({
      msg: `${id} is stopped`
    })

    return
  }
  const cmd = ['stop', id]
  updateStatus(id, 'stopping', { started: currentTimeFormatted() })
  dockerCommand(cmd.join(' '))
    .then(() => {
      updateStatus(id, 'stopped', { started: currentTimeFormatted() })
      res.send({
        msg: 'stopped successfully'
      })
    })
    .catch(err => {
      updateStatus(id, 'stopped', { started: currentTimeFormatted() })
      res.send({
        msg: err.message
      })
    })
}
