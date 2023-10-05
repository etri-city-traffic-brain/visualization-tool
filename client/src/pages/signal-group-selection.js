// 지도상에서 교차로 조회 및 정보 확인 기능 제공
// How to
// 전체 교차로 목록을 조회 후
// 사용자가 입력한 값에 따라 해당 노드를 보여지도록

import makeMap from '@/map2/make-map'
import * as maptalks from 'maptalks'
import extent from '@/map2/map-extent'
import mapService from '@/service/map-service'
import signalService from '@/service/signal-service'

const { log } = console

function getColor() {
  return "rgb(" + Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ',' +
    Math.floor(127 * Math.random()) + ')'
}

const addLayerTo = map => name =>
  new maptalks.VectorLayer(name, [], {}).addTo(map)

export default {
  name: 'SignalGroupSelection',
  props: ["height", "groupSelection", "signalGroups"],
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
      colorOptions: [
        { text: '빨강', value: 'ff0000' },
        { text: '노랑', value: 'FFD700' },
        { text: '파랑', value: '0000FF' },
        { text: '녹색', value: '7FFF00' },
        { text: '보라', value: '8A2BE2' },
      ],
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
      colorMap: {},
      isReady: false
    }
  },
  computed: {
    signalGroupsSorted() {
      const r = this.signalGroups.sort((a, b) => {
        const an = Number(a.split(' ')[1])
        const bn = Number(b.split(' ')[1])

        return an - bn
      })
      return r
    }
  },
  methods: {
    toggleGroupSelection(group) {
      if (this.targetGroups.includes(group)) {
        this.delTlGroup(group)
      } else {
        this.addTlGroup(group)
      }
    },
    getGroupColor(group) {
      return this.colorMap[group]
    },
    isAdded(group) {
      return this.targetGroups.includes(group)
    },
    animate(groupId) {
      const g = this.trafficLightsLayer.getGeometries().find(g => {
        if (groupId === g.$groupId) {
          return true
        }
      })

      if (!g) {
        return
      }

      this.map.animateTo({ center: g.getCenter(), zoom: 14 })
      this.update()
    },
    addTlGroup(groupId) {
      if (this.targetGroups.includes(groupId)) {
        return
      }
      this.targetGroups.push(groupId)
    },
    delTlGroup(groupId) {
      const idx = this.targetGroups.findIndex(v => v === groupId)
      if (idx >= 0) {
        this.targetGroups.splice(idx, 1)
      }
    },
    update() {
    },
    resize() {
      if (this.height) {
        return
      }
      this.mapHeight = window.innerHeight - 50 // update map height to current height
    },
    finishTlSelection() {

      if (this.targetGroups.length < 1) {
        this.$swal('신호 그룹을 하나이상 선택하세요')
        return
      }

      this.$emit("selection:finished", {
        junctions: this.targetGroups,
        center: this.centerMarker.getCoordinates(),
      });
    },
    showCenter() {
      const marker = this.centerMarker
      marker.setCoordinates(this.map.getCenter())
      marker.bringToFront()
    },
    updateSignalGroups() {
      this.trafficLightsLayer.getGeometries().forEach(g => {
        const obj = this.signalGroups.find(s => {
          const ooo = Object.entries(this.groupMap).find(([key, value]) => {
            if (value.includes(g.$nodeId)) {
              return true
            }
          }) || {}
          const groupId = ooo[0]
          if (groupId === s) {
            return true
          }
        })

        if (obj) {

          const myColor = this.colorMap[obj] || getColor()
          // Math.floor(Math.random() * 16777215).toString(16);
          this.colorMap[obj] = myColor

          g.$groupId = obj
          g.updateSymbol([
            {
              markerFill: myColor,
              markerWidth: 15,
              markerHeight: 15,
              textHaloFill: myColor,
              textHaloRadius: 2,
              textFill: 'white',
              textName: `${obj}`,
              textSize: 15,
              textDy: -20,
            }
          ])
          g.bringToFront()
        }
      })
    }
  },
  watch: {
    signalGroups(v) {

      this.trafficLightsLayer.getGeometries().forEach(g => {
        g.$groupId = ''
        g.updateSymbol([
          {
            markerType: 'ellipse',
            markerFill: 'gray',
            markerFillOpacity: 0.6,
            markerWidth: 5,
            markerHeight: 5,
            textSize: 20,
            textName: '',
          }
        ])
      })

      this.updateSignalGroups()

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
          markerWidth: 32,
          markerHeight: 46,
          textSize: 20,
        }
      ]
    })
    const tmpLayer = new maptalks.VectorLayer('tmp-01s', [], {}).addTo(this.map)

    const { features } = await mapService.getTrafficLights(extent(this.map))
    const groupMap2 = features.reduce((acc, cur) => {
      const nodes = acc[cur.properties.GROUP] || []
      nodes.push(cur.properties.NODE_ID)
      acc[cur.properties.GROUP] = nodes
      return acc
    }, {})
    this.groupOptions = Object.keys(groupMap2).sort()
    this.groupMap = groupMap2
    this.geometries = features.map(feature => {
      const crossName = signalService.nodeIdToName(feature.properties.NODE_ID)
      const trafficLight = new maptalks.Marker(feature.geometry.coordinates, {
        id: feature.properties.NODE_ID,
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
              markerWidth: 40,
              markerHeight: 40,
              textSize: 30,
              textDy: -20,
              textName: `${e.target.$groupId}(${e.target.$crossName})`
            }
          ])
          e.target.bringToFront()
        })
        .on('mouseout', e => {
          if (!e.target.$groupId) {
            return
          }
          e.target.updateSymbol([
            {
              markerWidth: 20,
              markerHeight: 20,
              textSize: 15,
              textDy: -20,
              textName: `${e.target.$groupId}`
            }
          ])
        })
        .on('click', e => {
          // this.addTlGroup(e.target.$groupId)
          this.toggleGroupSelection(e.target.$groupId)
        })
      trafficLight.$crossName = crossName
      trafficLight.$nodeId = feature.properties.NODE_ID

      return trafficLight
    })

    const addLayer = addLayerTo(this.map)
    this.trafficLightsLayer = addLayer('trafficLightsLayer')
    this.trafficLightsLayer.addGeometry(this.geometries)
    tmpLayer.addGeometry(this.centerMarker)
    this.update()

    this.updateSignalGroups()
    window.addEventListener('resize', this.resize.bind(this))
    this.resize()

    this.isReady = true

  },
  destroyed() {
    if (this.map) {
      this.map.remove()
    }
  }
}
