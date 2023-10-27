import * as maptalks from 'maptalks'

export default map => {
  const layer = new maptalks.VectorLayer('routeLayer', [], {
    enableAltitude: true,
    drawAltitude: {
      polygonFill: 'orange',
      // polygonOpacity: 0.3,
      lineWidth: 0
    }
  })

  return layer
}
