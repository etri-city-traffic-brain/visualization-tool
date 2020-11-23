
const router = require('express').Router();

// router.post('/train', require('./api-train'));
// router.post('/test', require('./api-test'));
// router.post('/fixed', require('./api-fixed'));
router.post('/train', require('./api-run'));
router.post('/test', require('./api-run'));
router.post('/fixed', require('./api-run'));

router.get('/reward', require('./api-reward'));
router.get('/phase', require('./api-phase'));

module.exports = router;
