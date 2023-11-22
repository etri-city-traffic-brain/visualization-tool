import { HTTP } from '@/http-common'

async function toXml({ json, from, to }) {
  return HTTP.post('/salt/v1/signal/jsontoxml', {
    json,
    from,
    to
  })
}

export default {
  toXml,
}
