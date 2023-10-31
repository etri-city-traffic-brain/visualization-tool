// 지도상에서 교차로 조회 및 정보 확인 기능 제공
// How to
// 전체 교차로 목록을 조회 후
// 사용자가 입력한 값에 따라 해당 노드를 보여지도록

import * as maptalks from 'maptalks'

import makeMap from '@/map2/make-map'
import extent from '@/map2/map-extent'
import mapService from '@/service/map-service'
import signalService from '@/service/signal-service'

const { log } = console

const addLayerTo = map => name =>
  new maptalks.VectorLayer(name, [], {}).addTo(map)

function setDefault(g) {
  if (!g) {
    return g
  }
  g.updateSymbol([
    {
      markerType: 'ellipse',
      markerFill: 'gray',
      markerFillOpacity: 0.6,
      markerWidth: 5,
      markerHeight: 5,
      // markerLineWidth: 2,
      textSize: 20,
      textFill: 'white',
      textHaloFill: 'gray',
      textHaloRadius: 2,
      textName: ''
    }
  ])

  return g
}

function getColor() {
  return "rgb(" + Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ')'
}
export default {
  name: 'Junction',
  props: ["height", "groupSelection"],
  data() {
    return {
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      junctions: [],
      trafficLightManager: null,
      trafficLightsLayer: null,
      selected: [],
      nodeId: '',
      geometries: [],
      color: 'yellow',
      typeOptions: [
        { text: '교차로 그룹', value: 'group' },
        { text: '교차로 아이디', value: 'id' },
        { text: '교차로 이름', value: 'name' }
      ],
      groupOptions: [],
      type: 'group',
      mapHeight: 640,
      hide: false,
      targetGroups: [],
      centerMarker: null,
      groupMap: {},
      groupColor: {}
    }
  },
  methods: {
    add(nodeId, color, groupId, nodeName) {
      const e = this.selected.find(s => s.id === nodeId)
      if (!e) {
        this.selected.push({
          id: nodeId,
          groupId,
          color,
          name: nodeName
        })
      }
    },
    del(id, groupId) {
      if (groupId) {
        const ids = this.selected.filter(s => s.groupId === groupId)
        ids.forEach(id => {
          const idx = this.selected.findIndex(s => s.groupId === id.groupId)
          if (idx >= 0) {
            this.selected.splice(idx, 1)
            const g = this.trafficLightsLayer.getGeometryById(id.id)
            setDefault(g)
          }
        })
      } else if (id) {
        const idx = this.selected.findIndex(s => s.id === id)
        this.selected.splice(idx, 1)
        this.geometries.forEach(g => {
          if (g.$nodeId === id) {
            setDefault(g)
          }
        })
      }

      this.update()
    },
    animate(id) {
      const g = this.trafficLightsLayer.getGeometryById(id)
      if (g) {
        this.map.animateTo({ center: g.getCenter(), zoom: 15 })
      }
      this.update()
    },
    addTlGroup(groupId) {
      if (this.targetGroups.includes(groupId)) {
        return
      }
      log('add TL Group', groupId)

      this.targetGroups.push(groupId)
    },
    delTlGroup(groupId) {
      const idx = this.targetGroups.findIndex(v => v === groupId)
      if (idx >= 0) {
        this.targetGroups.splice(idx, 1)
      }
    },
    getTL(groupId) {
      this.selected = []

      if (this.type === 'id') {
        this.geometries.filter(g => g.$nodeId.includes(groupId)).forEach(g => {
          this.add(g.$nodeId, 'gray', g.$groupId, g.$crossName)
        })
      } else if (this.type === 'name') {
        this.geometries.filter(g => g.$crossName.includes(groupId)).forEach(g => {
          this.add(g.$nodeId, 'gray', g.$groupId, g.$crossName)
        })
      } else if (this.type === 'group') {
        const nodIds = this.groupMap[groupId] || []
        nodIds.forEach(({ nodeId, nodeName }) => {
          const color = this.groupColor[groupId] || getColor()
          this.groupColor[groupId] = color
          this.add(nodeId, color, groupId, nodeName)
        })
      }
    },
    addNode(groupId) {
      if (this.type === 'id') {
        const obj = this.geometries.find(g => g.$nodeId === groupId)
        if (obj) {
          const color = this.groupColor[groupId] || getColor()
          this.groupColor[groupId] = color
          this.add(groupId, color, null, obj.$crossName)
          this.update()
          this.nodeId = ''
        }
      } else if (this.type === 'group') {
        const nodIds = this.groupMap[groupId]
        if (nodIds) {
          nodIds.forEach(node => {
            const color = this.groupColor[groupId] || getColor()
            this.groupColor[groupId] = color

            const name = signalService.nodeIdToName(node)
            this.add(node, color, groupId, name)
          })
        }
        this.nodeId = ''
        this.update()
      } else if (this.type === 'name') {
        this.geometries
          .map(v => ({
            nodeId: v.$nodeId,
            crossName: v.$crossName
          }))
          .filter(x => x.crossName === groupId)
          .forEach(d => {
            this.add(d.nodeId, this.color, null, d.crossName)
          })
        this.update()
        this.nodeId = ''
      }
    },
    update() {
      this.trafficLightsLayer.getGeometries().forEach(g => {
        const obj = this.selected.find(s => s.id === g.$nodeId)
        if (obj) {
          g.$groupId = obj.groupId
          g.updateSymbol([
            {
              markerFill: obj.color,
              markerWidth: 30,
              markerHeight: 30,
              textHaloFill: 'white',
              textHaloRadius: 2,
              textFill: 'black',
              textName: `${obj.groupId}(${obj.name})`,
              textSize: 15,
              textDy: -20,
            }
          ])
          g.bringToFront()
        }
      })
    },
    resize() {
      //
      if (this.height) {
        return
      }
      this.mapHeight = window.innerHeight - 50 // update map height to current height
    },
    finishTlSelection() {
      this.$emit("selection:finished", {
        junctions: this.targetGroups,
        center: this.centerMarker.getCoordinates(),
      });
    },
    showCenter() {
      this.centerMarker.setCoordinates(this.map.getCenter())
      this.centerMarker.bringToFront()
    }
  },
  async mounted() {

    this.map = makeMap({ mapId: this.mapId, zoom: 12 })

    if (this.height) {
      this.mapHeight = this.height
    }

    this.centerMarker = new maptalks.Marker(this.map.getCenter(), {
      id: 'tmp-01s',
      draggable: true,
      symbol: [
        {
          // markerType: 'ellipse',
          'markerType': 'path',
          'markerPath': 'M8 23l0 0 0 0 0 0 0 0 0 0c-4,-5 -8,-10 -8,-14 0,-5 4,-9 8,-9l0 0 0 0c4,0 8,4 8,9 0,4 -4,9 -8,14z M3,9 a5,5 0,1,0,0,-0.9Z',
          'markerFill': 'rgb(216,115,149)',
          'markerLineColor': '#fff',
          'markerPathWidth': 16,
          'markerPathHeight': 23,
          markerWidth: 35,
          markerHeight: 35,
          textSize: 20,
        }
      ]
    })
    const tmpLayer = new maptalks.VectorLayer('tmp-01s', [], {}).addTo(this.map)

    const { features } = await mapService.getTrafficLights(extent(this.map))
    this.groupMap = features.reduce((acc, cur) => {
      const nodes = acc[cur.properties.GROUP] || []
      nodes.push({
        nodeId: cur.properties.NODE_ID,
        nodeName: cur.properties.NAME,
        groupId: cur.properties.GROUP
      })
      acc[cur.properties.GROUP] = nodes
      return acc
    }, {})


    this.groupOptions = Object.keys(this.groupMap).sort()
    this.geometries = features.map(feature => {
      const crossName = feature.properties.NAME
      const coordinates = feature.geometry.coordinates
      const nodeId = feature.properties.NODE_ID
      const trafficLight = new maptalks.Marker(coordinates, {
        id: nodeId,
        symbol: [
          {
            markerType: 'ellipse',
            markerFill: 'gray',
            markerFillOpacity: 0.6,
            markerWidth: 5,
            markerHeight: 5,
            textSize: 20,
          }
        ]
      })
        .on('mouseenter', e => {
          if (!e.target.$groupId) {
            return
          }
          e.target.updateSymbol([
            {
              markerFillOpacity: 1,
              textName: `${e.target.$groupId}(${e.target.$crossName})`
            }
          ])
          e.target.bringToFront()

        })
        .on('mouseout', (e) => {
          e.target.updateSymbol([
            {
              markerFillOpacity: 1,
              textName: ``
            }
          ])
        })
      trafficLight.$crossName = crossName
      trafficLight.$nodeId = feature.properties.NODE_ID
      trafficLight.$groupId = feature.properties.GROUP
      return trafficLight
    })

    const addLayer = addLayerTo(this.map)
    this.trafficLightsLayer = addLayer('trafficLightsLayer')
    this.trafficLightsLayer.addGeometry(this.geometries)
    tmpLayer.addGeometry(this.centerMarker)
    this.update()

    window.addEventListener('resize', this.resize.bind(this))
    this.resize()
  },
  destroyed() {
    if (this.map) {
      this.map.remove()
    }
  }
}
