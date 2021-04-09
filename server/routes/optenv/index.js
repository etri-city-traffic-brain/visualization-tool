
const router = require('express').Router()
const controller = require('./optenv-controller')

router.get('/', controller.get)
router.post('/', controller.add)
router.put('/', controller.update)
router.delete('/', controller.remove)

module.exports = router
