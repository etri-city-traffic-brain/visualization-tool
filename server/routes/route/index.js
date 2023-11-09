const router = require('express').Router()

router.post('/', require('./api-create'))
router.delete('/:id', require('./api-remove'))
router.get('/', require('./api-list'))

router.get('/dong', require('./dong'))
router.get('/trip/:id/from', require('./trip-from'))
// router.get('/trip/:id/to', require('./trip-to'))
// router.get('/trip/od', require('./od'))
router.get('/trip/:id/tod', require('./tod'))

module.exports = router
