const createError = require('http-errors')
const { getOptEnvs } = require('../../globals')

module.exports = {
  async add (req, res, next) {
    console.log('add env')
    const env = req.body

    const exists = await getOptEnvs().find({ envName: env.envName }).value()
    if (exists) {
      next(createError(409, 'already exists'))
      return
    }

    await getOptEnvs().push({
      ...env
    })
      .write()
    res.send('success')
  },
  async update (req, res, next) {
    const env = req.body
    const conf = env.configuration
    getOptEnvs()
      .find({ envName: env.envName })
      .assign({
        // id: 'OPTI_202104_00693',
        // user: 'user1',
        description: env.description,
        role: 'optimization',
        type: 'optimization',
        // envName: 'aaa',
        configuration: conf
      })
      .write()
    res.send({
      success: true
    })
  },
  get (req, res, next) {
    const obj = getOptEnvs().value()

    res.send(obj)
  },
  async remove (req, res, next) {
    const id = req.query.id
    await getOptEnvs().remove({ id }).write()
    res.send('')
  }
}
