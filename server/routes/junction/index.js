/**
 * Signal Editor API
 *
 * author: Yeonheon Gu
 */

const router = require('express').Router();
const { signalService } = require('../../main/service');
// router.post('/create', require('./create'));
// router.get('/list', require('./get-simulations'));
// router.get('/get/:id', require('./get-simulation'));

router.get('/', (req, res) => {
  const info = {
    version: 1.0,
    description: 'signal service api',
  };
  res.send(info);
});

router.get('/signal', async (req, res) => {
  const { signal_id: signalId, version } = req.query;
  const { data } = await signalService.getSignal(signalId, version);
  res.json(data);
});

router.get('/signalinfo', async (req, res) => {
  const { signal_id: signalId, version } = req.query;
  const { data } = await signalService.getSignalInfo(signalId, version);
  res.json(data);
});

router.delete('/signal', async (req, res) => {
  const { signal_id: signalId, version } = req.query;
  const { data } = await signalService.removeSignal(signalId, version);
  res.json(data);
});

router.post('/signal', async (req, res) => {
  const { body } = req;
  await signalService.updateSignal(body);
  res.json({});
});

router.get('/connection', async (req, res) => {
  const { junction_id: junctionId } = req.query;
  if (!junctionId) {
    res.status(404).send(`cannot find junction ${junctionId}`);
    return;
  }
  try {
    const { data } = await signalService.getConnection(junctionId);
    res.json(data);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = router;
