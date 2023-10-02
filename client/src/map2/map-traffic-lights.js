// @ts-nocheck
/*!
 * Traffic Light Viewer
 */

import * as maptalks from 'maptalks'
import * as d3 from 'd3'
import extent from './map-extent'
import mapService from '../service/map-service'

import OptStatusLayer from './opt-status-layer'
import signalService from '@/service/signal-service'
import tlUtils from '@/config/utils'

import colorScale from '@/utils/colors-improve-rate'

const addLayerTo = map => name =>
  new maptalks.VectorLayer(name, [], {}).addTo(map)

const { log } = console

export default function SaltTrafficLightsLoader(map, groupIds, events) {
  map.setMinZoom(14)
  const addLayer = addLayerTo(map)
  const trafficLightsLayer = addLayer('trafficLightsLayer')
  const layer = new OptStatusLayer('hello')

  function makeTrafficLight(feature, color) {
    const nodeId = feature.properties.NODE_ID
    const nodeName = signalService.nodeIdToName(nodeId)
    const groupId = tlUtils.findGroupId(nodeId)

    const trafficLight = new maptalks.Marker(feature.geometry.coordinates, {
      symbol: [
        {
          textName: `${groupId}`,
          textSize: 14,
          textFill: 'white',
          textHaloFill: "black",
          textHaloRadius: 2,
          textDy: -20
        },
        {
          markerType: 'ellipse',
          markerFillOpacity: 0.9,
          markerWidth: 20,
          markerHeight: 20,
          markerLineWidth: 2,
          markerFill: color,

          textName: `${nodeName}`,
          textLineSpacing: 8,
          textAlign: 'left',
          textHorizontalAlignment: 'right',
          textSize: 12,
          textFill: '#ffffff',
          textHaloFill: "black",
          textHaloRadius: 2,
          textDx: 10,
          textDy: 40,
        },
      ]
    })
      .on('click', async ({ target }) => {
        if (!target) {
          return
        }
        events.$emit('junction:clicked', {
          nodeId: target.properties.NODE_ID,
          coordinates: target.toGeoJSONGeometry().coordinates
        })
      })
      .on('mouseenter', () => { })
      .on('mouseout', () => { })

    trafficLight.properties = feature.properties
    return trafficLight
  }
  let trainResult = []
  let testResult = {}
  let tType = 'test'
  async function load() {
    if (!trafficLightsLayer.isVisible()) {
      return
    }
    const { features } = await mapService.getTrafficLights(extent(map))
    trafficLightsLayer.clear()

    const geometries = features.map((feature, i) => {
      const groupId = tlUtils.findGroupId(feature.properties.NODE_ID)

      let color = 'gray'
      if (groupIds.length && groupIds.includes(groupId)) {
        color = 'red'
      }
      // groupIds.forEach(id => {
      //   if (groupId && id.indexOf(groupId) >= 0) {
      //     if (groupId !== 'SA 1') {
      //       color = 'red'
      //     }
      //   }
      // })

      const trafficLight = makeTrafficLight(feature, color, i)
      if (color === 'gray') {
        trafficLight.hide()
      }
      return trafficLight
    })
    trafficLightsLayer.addGeometry(geometries)

    if (trainResult.length > 0) {
      setOptTrainResult(trainResult)
    }
    if (Object.keys(testResult).length > 0) {
      setOptTestResult(testResult, tType)
    }
  }

  function setOptJunction(junctionIds) {

    const tlayer = map.getLayer('trafficLightsLayer')
    const data = []
    tlayer.getGeometries().forEach(g => {
      junctionIds.forEach(junctionId => {
        if (g.properties.NODE_ID === junctionId) {
          data.push({
            coord: g
              .getCoordinates()
              .add(0.0, 0.0003)
              .toArray(),
            text: '최적화 중 '
            // text: ''
          })
          // layer.setData([
          //   {
          //     coord: g.getCoordinates().add(0.00, 0.0003).toArray(),
          //     text: '최적화 중 '
          //   }
          // ])
        }
      })
      layer.setData(data)
    })
    layer.addTo(map)
  }

  // const colorScale = d3.scaleLinear()
  //   .domain([-30, -20, -10, 0, 10, 20, 30, 40, 50])
  //   .range(['#A9A9A9', 'gray', 'white', '#F0FFFF', 'yellow', 'orange', 'skyblue', 'yellow', '#7FFF00'])

  function setOptTrainResult(arr = []) {
    trainResult = arr
    const tlayer = map.getLayer('trafficLightsLayer')
    if (!tlayer) {
      return
    }

    const matchList = new Set()

    tlayer.getGeometries().forEach(g => {
      const nodeId = g.properties.NODE_ID
      const nodeName = signalService.nodeIdToName(nodeId)
      arr.forEach(item => {
        if (item.name === nodeName) {
          log('update signal', nodeId, nodeName)
          g.updateSymbol([
            {
            },
            {
              markerFill: colorScale(item.improvedRate),
              textName: `[${item.name}]\n 향샹률:${item.improvedRate} %\n 통행량: ${item.ftVehPassed} 대\n 평균속도:${item.ftAverageSpeed} km`,
              textLineSpacing: 8,
              textAlign: 'left',
              textHorizontalAlignment: 'right',
              textFill: colorScale(item.improvedRate),
            },
          ])
          matchList.add(g)
        }
      })
    })

    tlayer.getGeometries().forEach(g => {
      if (!matchList.has(g)) {
        g.hide()
      }
    })
  }

  function moveTo(crossName) {
    const tlayer = map.getLayer('trafficLightsLayer')

    tlayer.getGeometries().forEach(g => {
      if (g.properties.NAME === crossName) {
        map.animateTo({
          center: [g.getCoordinates().x, g.getCoordinates().y]
        })
      }
    })
  }

  function setOptTestResult(obj, type = 'test') {
    testResult = obj
    tType = type
    const tlayer = map.getLayer('trafficLightsLayer')

    tlayer.getGeometries().forEach(g => {

      const nodeId = g.properties.NODE_ID
      const nodeName = signalService.nodeIdToName(nodeId)

      Object.entries(testResult).forEach(([key, value]) => {
        if (key === nodeName) {

          g.updateSymbol([
            {
            },
            {
              markerFill: colorScale(value.improvement_rate),
              textName: type === 'test'
                ? `[${key}]\n 통행시간: ${value[type].travel_time} (s) \n 향상률: ${value.improvement_rate} % \n`
                : `[${key}]\n 통행시간: ${value[type].travel_time} (s)`,
              textLineSpacing: 8,
              textAlign: 'left',
              textHorizontalAlignment: 'right',
              textFill: colorScale(value.improvement_rate),
            },
          ])
        }
      })
    })
  }

  const optResultMap = {}
  function setOptResult2(arr, type) {

    optResultMap[type] = arr
    const tlayer = map.getLayer('trafficLightsLayer')
    if (!tlayer) {
      return
    }
    tlayer.getGeometries().forEach(g => {
      const nodeId = g.properties.NODE_ID
      const nodeName = signalService.nodeIdToName(nodeId)
      optResultMap[type].forEach(item => {
        if (item.name === nodeName) {
          if (type === 'test') {
            g.updateSymbol([
              {
              },
              {
                markerFill: colorScale(item.improvedRate),
                textName: `[${item.name}]\n 향샹률:${item.improvedRate} %\n 통행량: ${item.rlVehPassed} 대\n 평균속도:${item.rlAverageSpeed} km`,
                textLineSpacing: 8,
                textAlign: 'left',
                textHorizontalAlignment: 'right',
                textFill: colorScale(item.improvedRate),
              },
            ])
          } else {
            g.updateSymbol([
              {
              },
              {
                markerFill: colorScale(item.improvedRate),
                textName: `[${item.name}]\n 통행량: ${item.ftVehPassed} 대\n 평균속도:${item.ftAverageSpeed} km`,
                textLineSpacing: 8,
                textAlign: 'left',
                textHorizontalAlignment: 'right',
                textFill: colorScale(item.improvedRate),
              },
            ])
          }
        }
      })
    })
  }


  function clearOptJunction() {
    layer.setData([])
  }

  map.on('zoomend moveend', load)

  return {
    load,
    setOptJunction,
    clearOptJunction,
    setOptTrainResult,
    setOptTestResult,
    setOptResult2,
    moveTo
  }
}
