
import * as maptalks from 'maptalks'

import color from '@/utils/colors';
import { InputGroupPlugin } from 'bootstrap-vue';

export default (map, getGeometries) => {

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

  circle.on('click', () => {
    getGeometries().forEach(obj => {
      if(circle.containsPoint(obj.getCenter())) {
        console.log(obj.getCenter())
        obj.updateSymbol({
          // lineWidth,
          lineColor: 'black',
          markerPlacement: 'vertex-last', //vertex, point, vertex-first, vertex-last, center
          lineDasharray: []
        })
      }

    })
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
