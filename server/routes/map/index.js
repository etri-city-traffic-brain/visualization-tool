//    Map service API
//    2019
const router = require('express').Router()

router.get('/', require('./map'))
router.get('/links', require('./links'))
router.get('/traffic_lights', require('./traffic-lights'))
router.get('/grids', require('./grid'))
router.get('/links/:linkId', require('./links'))
router.get('/yuseong', require('./yuseong'))
router.get('/sejong', require('./sejong'))

module.exports = router
