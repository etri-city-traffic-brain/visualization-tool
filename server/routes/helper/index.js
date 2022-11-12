const router = require('express').Router()

const { config } = require('../../globals')

router.get('/docker', (req, res) => {
  res.send(config.docker)
})

module.exports = router
