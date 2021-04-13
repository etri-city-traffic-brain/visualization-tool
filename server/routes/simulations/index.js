/**
 * simulation management api router module
 *
 * last modified: 2018/11/27
 * author: beanpole
 */

const router = require('express').Router()

router.get('/', require('./api-get-simulations'))

router.get('/get/:id', require('./api-get-simulation'))
router.delete('/remove/:id', require('./api-remove-simulation'))
router.delete('/remove/user/:id', require('./api-remove-user'))
router.get('/result/:id/:type', require('./api-get-simulation-result'))

router.post('/upload/result', require('./api-upload-result'))
router.post('/upload/data', require('./api-upload-data'))

router.get('/download/data', require('./api-download-scenario-data'))
router.get('/download/config', require('./api-download-config'))
router.get('/download/scenarioByCoordinate', require('./api-download-scenario').handleDownloadScenarioByCoordinate)
router.get('/download/scenarioByRegion', require('./api-download-scenario').handleDownloadScenarioByRegion)
router.get('/download/result', require('./api-download-result'))

router.get('/scripts', require('./api-scripts'))

router.post('/create', require('./api-create'))
router.post('/update', require('./api-update-sim'))
router.post('/start', require('./api-start'))
router.post('/stop/:id', require('./api-stop'))

module.exports = router
