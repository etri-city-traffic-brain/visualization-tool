const router = require('express').Router()

router.get('/dong', require('./dong'))
router.post('/', require('./api-create'))
router.delete('/:id', require('./api-remove'))
router.get('/', require('./api-list'))
module.exports = router
