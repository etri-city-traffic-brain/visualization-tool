
const router = require('express').Router();

const service = require('../../main/service/prediction-service');

async function get(req, res) {
  try {
    console.log(req.body);
    const { data } = await service.getPrediction(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
}

router.post('/', get);

module.exports = router;
