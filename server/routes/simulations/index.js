/**
 * simulation management api router module
 *
 * last modified: 2018/11/27
 * author: beanpole
 */

const router = require('express').Router();

router.get('/', require('./get-simulations'));

router.get('/get/:id', require('./get-simulation'));
router.delete('/remove/:id', require('./api-remove-simulation'));
router.delete('/remove/user/:id', require('./api-remove-user'));
router.get('/result/:id/:type', require('./get-simulation-result'));

router.post('/upload/result', require('./upload-result'));
router.post('/upload/data', require('./upload-data'));

router.get('/download/data', require('./download-scenario-data'));
router.get('/download/config', require('./download-config'));
router.get('/download/scenarioByCoordinate', require('./download-scenario').handleDownloadScenarioByCoordinate);
router.get('/download/scenarioByRegion', require('./download-scenario').handleDownloadScenarioByRegion);
router.get('/download/result', require('./download-result'));

router.post('/create', require('./create'));
router.post('/start', require('./start'));
router.post('/stop/:id', require('./stop'));

module.exports = router;
