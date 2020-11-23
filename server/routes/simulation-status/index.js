//
//    simulation status updater
//    2020
//
const router = require('express').Router();
const createError = require('http-errors')

const Status = require('../../main/simulation-manager/simulatoin-status');
const { updateStatus } = require('../../globals');

const statusList = Object.values(Status);

async function updateStatuss(req, res, next) {
  const { id, status } = req.query;

  if (!statusList.includes(status)) {
    next(createError(400, `${status} status is not allowed`));
    return;
  }

  updateStatus(id, status);

  res.send({ id });
}

router.post('/', updateStatuss);
router.post('/:id', updateStatuss);

module.exports = router;
