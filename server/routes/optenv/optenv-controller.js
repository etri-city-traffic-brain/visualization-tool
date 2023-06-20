const createError = require('http-errors')
const { getOptEnvs } = require('../../globals')

module.exports = {
  async add(req, res, next) {
    const env = req.body

    const exists = await getOptEnvs().find({ envName: env.envName }).value()
    if (exists) {
      next(createError(409, 'already exists'))
      return
    }

    await getOptEnvs().push({
      ...env,
      created: new Date()
    })
      .write()
    res.send('success')
  },

  async update(req, res, next) {
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

  get(req, res, next) {
    const obj = getOptEnvs().value()
    obj.sort((a, b) => {
      const x = a.created ? new Date(a.created).getTime() : 0
      const y = b.created ? new Date(b.created).getTime() : 0
      return x <= y ? 1 : -1
    })
    res.send(obj)
  },

  async remove(req, res, next) {
    const id = req.query.id
    if (!id) {
      next(createError(400, 'id is empty'))
      return
    }
    getOptEnvs().remove({ id }).write()
    res.send({
      success: true,
    })
  }
}
