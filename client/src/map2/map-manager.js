/* eslint-disable no-console */

/**
 * UNIQ Sub-System
 *
 * Yeonheon Gu
 * Last modified: 2020-09-16
 */

// @ts-nocheck
import * as R from 'ramda'

import extent from './map-extent'
import makeId from './make-id'
import makeGeometry from './make-geometry'
import simulationService from '../service/simulation-service'
import mapService from '../service/map-service'

import {
  makeEdgeLayer,
  makeCanvasLayer,
  makeToolLayer,
  makeVdsLayer,
  makeCctvLayer,
  makeRseLayer,
  makeGridLayer,
} from '../layers'

const ZOOM_MINIMUM = 14

const { log } = console

/**
 *
 * @param {Object} param - Parameter
 * @param {Object} param.map - Maptalks Map Object
 * @param {string} param.simulationId - Simulation id
 * @param {Object} param.eventBus - Vue Object as event bus
 */
function MapManager({ map, simulationId, eventBus, useSaltLink = true }) {
  let currentSpeedsPerLink = {}
  let currentStep = 0

  const edgeLayer = makeEdgeLayer(map, eventBus)
  // const gridLayer = makeGridLayer(map)
  const canvasLayer = makeCanvasLayer(
    map,
    edgeLayer.getGeometries.bind(edgeLayer),
    eventBus,
    extent
  )
  const toolLayer = makeToolLayer(
    map,
    edgeLayer.getGeometries.bind(edgeLayer),
    eventBus
  )
  const vdsLayer = makeVdsLayer(
    map,
    edgeLayer.getGeometries.bind(edgeLayer),
    eventBus
  )
  const cctvLayer = makeCctvLayer(
    map,
    edgeLayer.getGeometries.bind(edgeLayer),
    eventBus
  )
  const rseLayer = makeRseLayer(
    map,
    edgeLayer.getGeometries.bind(edgeLayer),
    eventBus
  )

  map.addLayer(edgeLayer)
  map.addLayer(canvasLayer)
  map.addLayer(toolLayer)
  map.addLayer(rseLayer)
  map.addLayer(cctvLayer)
  map.addLayer(vdsLayer)
  // map.addLayer(gridLayer)

  rseLayer.hide()
  cctvLayer.hide()
  vdsLayer.hide()
  toolLayer.hide() // default hide

  function toggleFocusTool() {
    const showHide = toolLayer.isVisible()
      ? toolLayer.hide.bind(toolLayer)
      : toolLayer.show.bind(toolLayer)
    showHide()
    toolLayer.toggleFocusTool()
  }

  eventBus.$on('salt:data', data => {
    if (data.simulationId !== simulationId) {
      return
    }
    const speedsByEdgeId = data.roads.reduce((acc, road) => {
      acc[road.roadId.trim()] = road
      return acc
    }, {})
    canvasLayer.updateRealtimeData(speedsByEdgeId)
    edgeLayer.updateRealtimeData(speedsByEdgeId)
    toolLayer.updateRealtimeData(speedsByEdgeId)
  })

  const removeFeatures = layer => ids => layer.removeGeometry(ids)
  const removeEdges = removeFeatures(edgeLayer)

  const edgeMouseOver = ({ target }) => {
    target.bringToFront()
    target.setOptions({ arrowStyle: [2, 2] })
    // target.updateSymbol({ lineWidth: 4 });

    eventBus.$emit('link:hover', {
      ...target.properties,
      id: target.getId(),
      speeds: currentSpeedsPerLink[target.getId()]
    })
  }

  const edgeMouseOut = ({ target }) => {
    target.setOptions({ arrowStyle: null })
    // target.updateSymbol({ lineWidth: 1 });
  }

  eventBus.$on('vds:selected', edge => {
    edgeClicked({ target: edge })
  })

  const edgeClicked = ({ target }) => {
    if (eventBus) {
      eventBus.$emit('link:selected', {
        ...target.properties,
        id: target.getId(),
        speeds: currentSpeedsPerLink[target.getId()],
        ...target.properties
      })
    }

    // target.setInfoWindow({
    //   title: target.properties.LINK_ID,
    //   content: `
    //   <div class="content">
    //       <div> 속도: ${target.properties.SPEEDLH} </div>
    //       <div> 링크 길이: ${target.properties.edgeLen} m</div>
    //       <div></div>
    //       </div>
    //   `
    // })
    // target.openInfoWindow()
  }

  const addEventHandler = geometry =>
    geometry
      .on('click', edgeClicked)
      .on('mouseover', edgeMouseOver)
      .on('mouseout', edgeMouseOut)

  async function updateSimulationResult() {
    if (simulationId) {
      currentSpeedsPerLink = await simulationService.getSimulationResult(
        simulationId,
        extent(map)
      )
      edgeLayer.updateCongestion(currentSpeedsPerLink, currentStep)
      // gridLayer.updateGrid(simulationId, currentStep)
    }
  }

  function addFeatures(features) {
    const g = features.forEach(feature => {
      const f = R.compose(addEventHandler, makeGeometry)(feature)
      edgeLayer.addGeometry(f)
    })

    // edgeLayer.addGeometry(g)
  }

  async function loadMapData(event) {
    if (!useSaltLink) {
      eventBus.$emit('map:loaded')
      return
    }

    try {
      const { features } = await mapService.getMap(extent(map))
      if (event === 'zoomend') {
        removeEdges(edgeLayer.getGeometries())
        addFeatures(features)
      } else if (event === 'moveend') {
        const edgesExisted = edgeLayer
          .getGeometries()
          .map(geometry => geometry.getId())
        const idsNew = features.map(makeId)
        const idsWillBeRemoved = R.difference(edgesExisted, idsNew)
        const idsWillBeAdded = R.difference(idsNew, edgesExisted)
        removeEdges(idsWillBeRemoved)
        const added = features.filter(feature =>
          idsWillBeAdded.includes(makeId(feature))
        )
        addFeatures(added)
      } else {
        addFeatures(features)
      }
      eventBus.$emit('map:loaded')
    } catch (err) {
      log(err.message)
    }
    await updateSimulationResult()
  }

  function changeStep(step) {
    currentStep = step
    edgeLayer.updateCongestion(currentSpeedsPerLink, currentStep)
    // gridLayer.updateGrid(simulationId, currentStep)
  }

  const handleZoomEvent = async event => {
    const zoom = map.getZoom()
    if (zoom <= ZOOM_MINIMUM) {
      // gridLayer.updateGrid(simulationId, currentStep)
      return
    } else {
      await loadMapData(event.type)
    }
    if (eventBus) {
      const data = {
        zoom,
        extent: extent(map),
        simulationId
      }

      // console.log('salt:set', data.simulationId)
      eventBus.$emit('map:moved', data)
      eventBus.$emit('salt:set', data)
    }
  }

  function getEdgesInView() {
    // const edgesExisted = edgeLayer.getGeometries().map(geometry => geometry.getId())
    // const { features } = await mapService.getMap(extent(map))

    // console.log(currentSpeedsPerLink)
    return currentSpeedsPerLink
  }

  map.on('zoomend moveend', handleZoomEvent)

  // map.on('zoomend', () => { console.log('zoom end') })
  // map.on('moveend', () => { console.log('move end') })

  return {
    loadMapData,
    changeStep,
    toggleFocusTool,
    map,
    getEdgesInView,
    bus: eventBus,
    showRse(rseId, links) {
      console.log('showRse')
      edgeLayer.getGeometries().forEach(feature => {
        const linkId = feature.properties.LINK_ID

        links.forEach(link => {
          if (linkId === link) {
            // feature.properties.vdsId = vdsId.vdsId
            // feature.properties.secionId = vdsId.sectionId
            // feature.properties.sId = vdsId.sId
            // feature.properties.dId = vdsId.dId
            feature.properties.rseId = rseId

            feature.updateSymbol({
              lineWidth: 20,
              lineColor: '#1bbc9b'
            })

            feature.flash(
              200, // flash interval in ms
              5, // count
              function () {
                // callback when flash end
                // alert('flash ended')
                feature.updateSymbol({
                  lineWidth: 5,
                  lineColor: 'black'
                })
              }
            )
          }
        })
      })
    },
    getCurrentLinks() {
      return edgeLayer.getGeometries()
    },
    edgeLayer
  }
}

export default MapManager
