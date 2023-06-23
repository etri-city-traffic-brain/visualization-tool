const router = require('express').Router()

// router.post('/train', require('./api-train'));
// router.post('/test', require('./api-test'));
// router.post('/fixed', require('./api-fixed'));
router.post('/train', require('./api-run'))
router.post('/test', require('./api-run'))
router.post('/fixed', require('./api-run'))

router.post('/stop', require('./api-stop'))

router.get('/reward', require('./api-reward'))
router.get('/reward/total', require('./api-reward-total'))
router.get('/phase', require('./api-phase'))

router.post('/upload/model', require('./api-upload-model'))

router.get('/phasereward', require('./api-phase-reward'))

router.get('/result', require('./api-optimization-result'))

module.exports = router
