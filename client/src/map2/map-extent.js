
/**
 * Get the geographical extent of map's current view extent
 */
const getExtent = (map) => {

  const extent = map.getExtent();
  const min = extent.getMin();
  const max = extent.getMax();
  const zoom = map.getZoom();

  if (zoom >= 19) { // bigger rectangle than current extent
    min.x -= 0.0012;
    min.y -= 0.0014;
    max.x += 0.0012;
    max.y += 0.0014;
  }
  return {
    min,
    max,
    zoom,
  };
};

export default getExtent;
