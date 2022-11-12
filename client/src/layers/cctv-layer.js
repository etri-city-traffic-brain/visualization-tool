import * as maptalks from 'maptalks'
import axios from 'axios'

const symbolOrigin = {
  lineWidth: 2,
  lineColor: '#90ee90',
  textSize: 12,
  textFill: '#90ee90',
  polygonOpacity: 0.4
}

const symbolHighlight = {
  lineWidth: 12,
  lineColor: '#3399ff',
  textSize: 20,
  polygonFill: '#3399ff',
  textFill: '#3399ff',
  polygonOpacity: 0.4
}

export default (map, getEdges, eventBus) => {
  const layer = new maptalks.VectorLayer('cctv', [])
  axios({
    url: '/salt/v1/cctv',
    method: 'get'
  })
    .then(res => res.data)
    .then(items => {
      items.forEach(item => {
        const circle = new maptalks.Circle(item.location, 20, {
          symbol: {
            ...symbolOrigin,
            textName: 'CCTV(' + item.name + ')',
            textDy: -20,
            textDx: 0
          }
        }).addTo(layer)
        circle.on('mouseover', ({ target: t }) =>
          t.updateSymbol(symbolHighlight)
        )
        circle.on('mouseout', ({ target: t }) => t.updateSymbol(symbolOrigin))
        circle.on('click', x => {
          eventBus.$emit('cctv:selected', {
            ...item
          })
        })
      })
    })
  return layer
}
