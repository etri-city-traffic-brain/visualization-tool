const fs = require('fs')
const multer = require('multer')
const path = require('path')
const createError = require('http-errors')

const cookSimulationResult = require('../../main/simulation-manager/cook')

const {
  getSimulation,
  getSimulations,
  currentTimeFormatted,
  config,
  updateStatus
} = require('../../globals')

const { saltPath: { output } } = config

const prepareDir = (targetPath) => {
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath)
  }
}

module.exports = function upload (req, res, next) {
  const { id } = req.query
  const targetPath = path.join(output, id)

  prepareDir(targetPath)

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, targetPath),
    filename: (req, file, cb) => cb(null, file.originalname)
  })

  const fileFilter = (req, file, cb) => {
    if (file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(null, false)
    }
  }

  const upload = multer({ storage, fileFilter }).single('file')
  upload(req, res, async (err) => {
    if (err) {
      res.statusMessage = 'Error uploading file'
      res.status(404).end()
      return
    }

    updateStatus(id, 'running', { started: currentTimeFormatted() })

    const simulation = getSimulation(id)

    try {
      await cookSimulationResult({
        simulationId: id,
        duration: simulation.configuration.end,
        period: simulation.configuration.period
      })

      updateStatus(id, 'finished', { ended: currentTimeFormatted() })

      res.end('File is uploaded')
    } catch (err) {
      updateStatus(id, 'error', {
        ended: currentTimeFormatted(),
        error: err.message
      })
      next(createError(500, `${err.message} invalid data format`))
    }
  })
}
