const { dockerCommand } = require('docker-cli-js')

const { updateStatus, currentTimeFormatted, getSimulation } = require('../../globals')

module.exports = async (req, res, next) => {
  const { id } = req.query
  const cmd = [
    'stop', id
  ]
  updateStatus(id, 'stopping', { started: currentTimeFormatted() })
  dockerCommand(cmd.join(' ')).then(() => {
    updateStatus(id, 'stopped', { started: currentTimeFormatted() })
    res.send({
      msg: 'stopped successfully'
    })
  }).catch(() => {
    res.send({
      msg: 'fail to stop'
    })
  })
}
