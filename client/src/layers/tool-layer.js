
import * as maptalks from 'maptalks'

import color from '@/utils/colors';

export default (map, eventBus) => {

  const layer = new maptalks.VectorLayer('toolLayer', [])

  map.on('zoomend moveend', (event) => {
    const map = event.target;
    if(map.getZoom() >= 19 || map.getZoom() <= 14) {
      // layer.hide()
    } else {
      // layer.show()
    }
  });


  var circle = new maptalks.Circle(map.getCenter(), 80,{
    draggable: true,
    symbol: {
      lineColor: '#34495e',
      lineWidth: 2,
      polygonFill: '#1bbc9b',
      polygonOpacity: 0.2
    }
  });
  layer.addGeometry([circle])

  layer.startEdit = () => {
    // circle.startEdit({
    //   fixAspectRatio: true,
    // })

    setTimeout(() => {
      // circle.endEdit()
    }, 3000)
  }

  return layer
};
