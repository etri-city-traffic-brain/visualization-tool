import * as maptalks from 'maptalks';

const { VectorLayer } = maptalks;
const { GeoJSON: { toGeometry } } = maptalks;

import mapService from '../service/map-service';
import statisticsService from '../service/statistics-service';
import gridColor from '../utils/colors'

const { log } = console

async function updateGrid(simulationId, currentStep, gridLayer) {
  try {
    if (!gridLayer.gridData) {
      let gridData = await statisticsService.getSpeedsPerGrid(simulationId);
      gridLayer.gridData = gridData
    }

    if (!gridLayer.isVisible()) {
      return
    }

    if (!gridLayer.gridData) {
      return
    }
    gridLayer.getGeometries().forEach((box) => {
      const speeds = gridLayer.gridData[box.getId()]
      const speed = speeds && speeds[currentStep] || 0
      if (speed) {
        const color = gridColor(gridLayer.gridData[box.getId()][currentStep]) || 'gray'
        box.updateSymbol({
          polygonFill: color
        });
        box.show()
      } else {
        box.hide()
      }
    })

  } catch (err) {
    log(err.message)
  }
}

async function loadGrid(gridLayer, simulationId) {

  if (gridLayer.getGeometries().length > 0) {
    return;
  }

  const { features } = await mapService.getGrids();
  features.forEach((feature) => {
    const geometry = toGeometry(feature);
    geometry.updateSymbol({
      lineColor: 'black',
      lineWidth: 1,
      polygonFill: 'gray',
    });
    geometry.setId(feature.properties.GRID_ID);
    gridLayer.addGeometry(geometry);
  });
  gridLayer.setOpacity(0.6);
  log('load grid data', gridLayer.getGeometries().length)
  setTimeout(() => updateGrid(simulationId, 0, gridLayer), 500)
}

function makeGridLayer(map, simulationId) {
  const layer = new VectorLayer('gridLayer', [], {})
  map.on('zoomend moveend', async (event) => {
    const map = event.target;
    if (map.getZoom() <= 14) {
      await loadGrid(layer, simulationId);

      layer.show()
    } else {
      layer.hide()
    }
  });

  layer.updateGrid = (sId, currentStep) => {
    updateGrid(sId, currentStep, layer)
  }

  return layer;
}

export default makeGridLayer
