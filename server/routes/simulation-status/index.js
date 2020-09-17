//
//    simulation status listener
//    2019
//    simulator must send 'finished' event
//    if not server cannot notice that simulation is finished
//
const router = require('express').Router();

// const handleSimulationResult = require('./handle-status-notification');
const handleSimulationStatus = require('./handle-status-notification-standalone');
const Status = require('../../main/status');

const {
  db: { getSimulations },
} = global.SALT;


const statusList = Object.values(Status);

// SALT simulator send its status using this interface

async function updateStatus(req, res, next) {
  const { id, status, text } = req.query;

  if (!statusList.includes(status)) {
    next(new Error(`${status} status is not allowed`));
    return;
  }

  const simulation = getSimulations().find({ id }).value();
  if (!simulation) {
    next();
    return;
  }

  handleSimulationStatus({ simulation, status, text });

  res.json({
    id,
  });
}

router.post('/', updateStatus);
router.post('/:id', updateStatus);

module.exports = router;
