/* eslint-disable no-console */

/**
 * UNIQ Sub-System
 *
 * Yeonheon Gu
 * Last modified: 2020-09-16
 */

// @ts-nocheck
import * as R from 'ramda';

import extent from './map-extent';
import makeId from './make-id';
import makeGeometry from './make-geometry';

import simulationService from '../service/simulation-service';
import mapService from '../service/map-service';

import { makeEdgeLayer, makeCanvasLayer, makeGridLayer } from '../layers'

const ZOOM_MINIMUM = 14;

const { log } = console

function MapManager({map, simulationId, eventBus}) {
  log('map-manager created')
  let currentSpeedsPerLink = {};
  let currentStep = 0;

  const edgeLayer = makeEdgeLayer(map, eventBus);
  const gridLayer = makeGridLayer(map)
  const canvasLayer = makeCanvasLayer(map, edgeLayer.getGeometries.bind(edgeLayer), eventBus, extent)
  map.addLayer(edgeLayer)
  map.addLayer(gridLayer)
  map.addLayer(canvasLayer)

  const removeFeatures = layer => ids => layer.removeGeometry(ids);
  const removeEdges = removeFeatures(edgeLayer);

  const edgeMouseOver = ({ target }) => {
    target.bringToFront();
    target.setOptions({ arrowStyle: [2, 2] });
    target.updateSymbol({ lineWidth: 4 });
  };

  const edgeMouseOut = ({ target }) => {
    target.setOptions({ arrowStyle: null });
    target.updateSymbol({ lineWidth: 1 });
  };

  const edgeClicked = ({ target }) => {
    if(eventBus) {
      eventBus.$emit('link:selected', {
        ...target.properties,
        id: target.getId(),
        speeds: currentSpeedsPerLink[target.getId()],
      })
    }

    target.setInfoWindow({
      title: target.properties.LINK_ID,
      content: JSON.stringify(target.properties, false, 2),
    });

    target.openInfoWindow();

  }

  const addEventHandler = geometry =>
    geometry
      .on('click', edgeClicked)
      .on('mouseover', edgeMouseOver)
      .on('mouseout', edgeMouseOut);

  async function updateSimulationResult() {
    currentSpeedsPerLink = await simulationService.getSimulationResult(simulationId, extent(map));
    log('edges loaded:', edgeLayer.getGeometries().length)
    edgeLayer.updateCongestion(currentSpeedsPerLink, currentStep);
    gridLayer.updateGrid(simulationId, currentStep);
  }

  function addFeatures(features) {
    features.forEach((feature) => {
      R.compose(
        edgeLayer.addGeometry.bind(edgeLayer),
        addEventHandler,
        makeGeometry
      )(feature);
    });
  }

  async function loadMapData(event) {
    const edgesExisted = edgeLayer.getGeometries().map(geometry => geometry.getId());

    try {
      const { features } = await mapService.getMap(extent(map));
      if(event === 'zoomend') {
        removeEdges(edgesExisted);
        addFeatures(features)
      } else if(event === 'moveend') {
        const edgesNew = features.map(makeId);
        const willBeRemoved = R.difference(edgesExisted, edgesNew);
        const willBeAdded = R.difference(edgesNew, edgesExisted);
        removeEdges(willBeRemoved);
        addFeatures(features.filter(feature => willBeAdded.includes(makeId(feature))))
      } else {
        addFeatures(features)
      }
    } catch (err) {
      log(err.message)
    }
    await updateSimulationResult();
  }

  function changeStep(step) {
    currentStep = step;
    edgeLayer.updateCongestion(currentSpeedsPerLink, currentStep);
    gridLayer.updateGrid(simulationId, currentStep);
  }

  const handleZoomEvent = async (event) => {
    const zoom = map.getZoom();
    if (zoom <= ZOOM_MINIMUM) {
      gridLayer.updateGrid(simulationId, currentStep)
      return;
    } else {
      await loadMapData(event.type);
    }
    if(eventBus) {
      eventBus.$emit('map:moved', {
        zoom,
        extent: extent(map)
      })
    }
  };

  map.on('zoomend moveend', handleZoomEvent);

  return {
    loadMapData,
    changeStep,
  };
}

export default MapManager;
