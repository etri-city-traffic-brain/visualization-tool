/**
 * Get the geographical extent of map's current view extent
 */
const getExtent = map => {
  const extent = map.getExtent()
  const min = extent.getMin()
  const max = extent.getMax()
  const zoom = map.getZoom()

  min.x -= min.x * 0.000002
  min.y -= min.y * 0.000005
  max.x += max.x * 0.000002
  max.y += max.y * 0.000005

  // min.x -= min.x * 0.000002
  // min.y -= min.y * 0.00009
  // max.x += max.x * 0.00006
  // max.y += max.y * 0.000005

  return {
    min,
    max,
    zoom
  }
}

export default getExtent
