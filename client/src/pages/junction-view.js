import makeMap from '@/map2/make-map'
import * as maptalks from 'maptalks'
import extent from '@/map2/map-extent'
import mapService from '@/service/map-service'
import signalService from '@/service/signal-service'

import signalGroups from '@/config/junction-config'
import Vue from 'vue'

import groupMap from '@/config/signal-group'

// const groupMap = signalGroups
//   .map(value => {
//     return {
//       groupId: value.properties.groupId,
//       nodeIds: value.properties.junctions
//       // color: value.properties.color
//     }
//   })
//   .reduce((acc, cur) => {
//     acc[cur.groupId] = cur.nodeIds
//     return acc
//   }, {})

const addLayerTo = map => name =>
  new maptalks.VectorLayer(name, [], {}).addTo(map)

function setDefault (g) {
  if (g) {
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
        textHaloRadius: 2
      }
    ])
  }
  return g
}

// 지도상에서 교차로 조회 및 정보 확인 기능 제공
// How to
// 전체 교차로 목록을 조회 후
// 사용자가 입력한 값에 따라 해당 노드를 보여지도록
export default {
  name: 'junction-view',
  data () {
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
        { text: '빨강', value: 'red' },
        { text: '노랑', value: 'yellow' },
        { text: '파랑', value: 'blue' },
        { text: '녹색', value: 'green' },
        { text: '보라', value: 'purple' }
      ],
      color: 'yellow',
      typeOptions: [
        { text: '교차로 그룹', value: 'group' },
        { text: '교차로 아이디', value: 'id' },
        { text: '교차로 이름', value: 'name' }
      ],
      groupOptions: [],
      type: 'id'
    }
  },
  methods: {
    add (nodeId, color, groupId, nodeName) {
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
    del (id, groupId) {
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
    animate (id) {
      const g = this.trafficLightsLayer.getGeometryById(id)
      if (g) {
        this.map.animateTo({ center: g.getCenter(), zoom: 15 })
      }
    },
    addNode (id) {
      if (this.type === 'id') {
        const obj = this.geometries.find(g => g.$nodeId === id)
        if (obj) {
          this.add(id, this.color, null, obj.$crossName)
          this.update()
          this.nodeId = ''
        }
      } else if (this.type === 'group') {
        const nodIds = groupMap[id]
        if (nodIds) {
          nodIds.forEach(node => {
            const name = signalService.nodeIdToName(node)
            this.add(node, this.color, id, name)
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
          .filter(x => x.crossName === id)
          .forEach(d => {
            this.add(d.nodeId, this.color, null, d.crossName)
          })
        this.update()
        this.nodeId = ''
      }
    },
    update () {
      this.geometries.forEach(g => {
        const obj = this.selected.find(s => s.id === g.$nodeId)
        if (obj) {
          g.updateSymbol([
            {
              markerFill: obj.color,
              markerWidth: 20,
              markerHeight: 20
            }
          ])
          g.bringToFront()
        }
      })
    }
  },

  async mounted () {
    this.groupOptions = Object.keys(groupMap).sort()
    this.map = makeMap({ mapId: this.mapId, zoom: 12 })
    const { features } = await mapService.getTrafficLights(extent(this.map))

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
            textFill: 'white',
            textHaloFill: 'blue',
            textHaloRadius: 2
          }
        ]
      })
        .on('mouseenter', e => {
          e.target.updateSymbol([
            {
              markerFillOpacity: 1,
              textName: e.target.$crossName || 'Undefined'
            }
          ])
          e.target.bringToFront()
        })
        .on('mouseout', e => {
          e.target.updateSymbol([
            {
              textName: ''
            }
          ])
        })
      trafficLight.$crossName = crossName
      trafficLight.$nodeId = feature.properties.NODE_ID

      return trafficLight
    })

    const addLayer = addLayerTo(this.map)
    this.trafficLightsLayer = addLayer('trafficLightsLayer')
    this.trafficLightsLayer.addGeometry(this.geometries)
    this.update()
  },
  destroyed () {
    if (this.map) {
      this.map.remove()
    }
  }
}
