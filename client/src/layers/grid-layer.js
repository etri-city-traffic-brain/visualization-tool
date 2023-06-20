import * as maptalks from 'maptalks';

import mapService from '../service/map-service';
const { VectorLayer } = maptalks;
import statisticsService from '../service/statistics-service';
import gridColor from '../utils/colors'
const { GeoJSON: { toGeometry } } = maptalks;
let gridData;
async function updateGrid(simulationId, currentStep, gridLayer) {
  if (gridLayer.isVisible()) {
    gridData = await statisticsService.getSpeedsPerGrid(simulationId);

    if (gridData) {
      gridLayer.getGeometries().forEach((geometry, i) => {
        const speeds = gridData[geometry.getId()];
        if (i === 0) {
          // console.log(speeds);
          // console.log('max', Math.max(...speeds), Math.min(...speeds));
        }

        const speed = speeds && speeds[currentStep] || 0
        if (speed) {
          geometry.updateSymbol({
            // polygonFill: color(gridData[geometry.getId()][currentStep]) || 'gray'
            polygonFill: gridColor(gridData[geometry.getId()][currentStep]) || 'gray'
          });
        }
      });
    }
  }
}

async function loadGrid(gridLayer) {
  if (gridLayer.getGeometries().length > 0) {
    return;
  }


  const { features } = await mapService.getGrids();
  features.forEach((feature) => {
    const geometry = toGeometry(feature);
    geometry.updateSymbol({
      lineColor: 'blue',
      lineWidth: 2,
      polygonFill: 'gray',
    });
    geometry.setId(feature.properties.GRID_ID);
    gridLayer.addGeometry(geometry);
  });
  gridLayer.setOpacity(0.6);
}

function makeGridLayer(map) {
  const layer = new VectorLayer('gridLayer', [], {})
  map.on('zoomend moveend', async (event) => {
    const map = event.target;
    if (map.getZoom() <= 14) {
      await loadGrid(layer);
      layer.show()
    } else {
      layer.hide()
    }
  });
  layer.updateGrid = (sId, currentStep) => {
    // updateGrid(sId, currentStep, layer)
  }
  return layer;
}

// export default () => new VectorLayer('gridLayer', [], {});
export default makeGridLayer
