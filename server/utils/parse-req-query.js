
const parseMapReqParam = (req) => {
  const { query } = req

  const extent = JSON.parse(query.extent)
  const zoom = +query.zoom
  const type = zoom > 16 ? 'cells' : 'links'
  return {
    type,
    extent,
    zoom
  }
}

module.exports = parseMapReqParam
