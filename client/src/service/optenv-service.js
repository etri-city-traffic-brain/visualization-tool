import { HTTP } from '@/http-common'
const { log } = console
async function get () {
  try {
    const res = await HTTP.get('/salt/v1/optenv')
    return res.data
  } catch (err) {
    log(err)
    return []
  }
}

async function add (env) {
  return HTTP.post('/salt/v1/optenv', env)
}

async function update (env) {
  return HTTP.put('/salt/v1/optenv', env)
}

async function remove (id) {
  return HTTP.delete(`/salt/v1/optenv?id=${id}`)
}

export default {
  add, get, remove, update
}
