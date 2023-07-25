import makeMap from '@/map2/make-map'
import * as maptalks from 'maptalks'
import extent from '@/map2/map-extent'
import mapService from '@/service/map-service'
import signalService from '@/service/signal-service'

import signalGroups from '@/config/junction-config'

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

function setDefault(g) {
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
        textHaloRadius: 2,
        textName: ''
      }
    ])
  }
  return g
}

const { log } = console
// 지도상에서 교차로 조회 및 정보 확인 기능 제공
// How to
// 전체 교차로 목록을 조회 후
// 사용자가 입력한 값에 따라 해당 노드를 보여지도록
export default {
  name: 'Junction',
  props: ["height"],
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
        // { text: '빨강', value: 'red' },
        // { text: '노랑', value: 'yellow' },
        // { text: '파랑', value: 'blue' },
        // { text: '녹색', value: 'green' },
        // { text: '보라', value: 'purple' }
        { text: 'IndianRed', value: 'CD5C5C' },
        { text: 'LightCoral', value: 'F08080' },
        { text: 'Salmon', value: 'FA8072' },
        { text: 'DarkSalmon', value: 'E9967A' },
        { text: 'LightSalmon', value: 'FFA07A' },
        { text: 'Crimson', value: 'DC143C' },
        { text: 'Red', value: 'FF0000' },
        { text: 'FireBrick', value: 'B22222' },
        { text: 'DarkRed', value: '8B0000' },


        { text: 'HotPink', value: 'FF69B4' },
        { text: 'DeepPink', value: 'FF1493' },
        { text: 'MediumVioletRed', value: 'C71585' },
        { text: 'PaleVioletRed', value: 'DB7093' },


        { text: 'OrangeRed', value: 'FF4500' },
        { text: 'DarkOrange', value: 'FF8C00' },
        { text: 'Orange', value: 'FFA500' },
        { text: 'Gold', value: 'FFD700' },
        { text: 'Yellow', value: 'FFFF00' },
        { text: 'LightYellow', value: 'FFFFE0' },
        { text: 'LemonChiffon', value: 'FFFACD' },
        { text: 'LightGoldenrodYellow', value: 'FAFAD2' },
        { text: 'PapayaWhip', value: 'FFEFD5' },
        { text: 'Moccasin', value: 'FFE4B5' },
        { text: 'PeachPuff', value: 'FFDAB9' },
        { text: 'PaleGoldenrod', value: 'EEE8AA' },
        { text: 'Khaki', value: 'F0E68C' },
        { text: 'DarkKhaki', value: 'BDB76B' },


        { text: 'Plum', value: 'DDA0DD' },
        { text: 'Violet', value: 'EE82EE' },
        { text: 'Orchid', value: 'DA70D6' },
        { text: 'Fuchsia', value: 'FF00FF' },
        { text: 'MediumOrchid', value: 'BA55D3' },
        { text: 'MediumPurple', value: '9370DB' },
        { text: 'BlueViolet', value: '8A2BE2' },
        { text: 'DarkViolet', value: '9400D3' },
        { text: 'DarkOrchid', value: '9932CC' },
        { text: 'DarkMagenta', value: '8B008B' },
        { text: 'Purple', value: '800080' },
        { text: 'RebeccaPurple', value: '663399' },
        { text: 'Indigo', value: '4B0082' },
        { text: 'MediumSlateBlue', value: '7B68EE' },
        { text: 'SlateBlue', value: '6A5ACD' },
        { text: 'GreenYellow', value: 'ADFF2F' },
        { text: 'Chartreuse', value: '7FFF00' },
        { text: 'LawnGreen', value: '7CFC00' },
        { text: 'Lime', value: '00FF00' },
        { text: 'LimeGreen', value: '32CD32' },
        { text: 'PaleGreen', value: '98FB98' },
        { text: 'LightGreen', value: '90EE90' },
        { text: 'MediumSpringGreen', value: '00FA9A' },
        { text: 'SpringGreen', value: '00FF7F' },
        { text: 'MediumSeaGreen', value: '3CB371' },
        { text: 'SeaGreen', value: '2E8B57' },
        { text: 'ForestGreen', value: '228B22' },
        { text: 'Green', value: '008000' },
        { text: 'DarkGreen', value: '006400' },
        { text: 'YellowGreen', value: '9ACD32' },
        { text: 'OliveDrab', value: '6B8E23' },
        { text: 'Olive', value: '808000' },
        { text: 'DarkOliveGreen', value: '556B2F' },
        { text: 'MediumAquamarine', value: '66CDAA' },
        { text: 'DarkSeaGreen', value: '8FBC8F' },
        { text: 'LightSeaGreen', value: '20B2AA' },
        { text: 'DarkCyan', value: '008B8B' },
        { text: 'Teal', value: '008080' },
        { text: 'Blues', value: 'CyansAqua	00FFFF' },
        { text: 'Cyan', value: '00FFFF' },
        { text: 'LightCyan', value: 'E0FFFF' },
        { text: 'PaleTurquoise', value: 'AFEEEE' },
        { text: 'Aquamarine', value: '7FFFD4' },
        { text: 'Turquoise', value: '40E0D0' },
        { text: 'MediumTurquoise', value: '48D1CC' },
        { text: 'DarkTurquoise', value: '00CED1' },
        { text: 'CadetBlue', value: '5F9EA0' },
        { text: 'SteelBlue', value: '4682B4' },
        { text: 'LightSteelBlue', value: 'B0C4DE' },
        { text: 'PowderBlue', value: 'B0E0E6' },
        { text: 'LightBlue', value: 'ADD8E6' },
        { text: 'SkyBlue', value: '87CEEB' },
        { text: 'LightSkyBlue', value: '87CEFA' },
        { text: 'DeepSkyBlue', value: '00BFFF' },
        { text: 'DodgerBlue', value: '1E90FF' },
        { text: 'CornflowerBlue', value: '6495ED' },
        { text: 'RoyalBlue', value: '4169E1' },
        { text: 'Blue', value: '0000FF' },
        { text: 'MediumBlue', value: '0000CD' },
        { text: 'DarkBlue', value: '00008B' },
        { text: 'Navy', value: '000080' },
        { text: 'MidnightBlue', value: '191970' },
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
      console.log('delete', groupId)
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

    getTL(groupId) {
      this.selected = []

      if (this.type === 'id') {
        const objs = this.geometries.filter(g => {
          return g.$nodeId.includes(groupId)
        })
        objs.forEach(obj => {
          const nodeId = obj.$nodeId
          const ooo = Object.entries(groupMap).find(([key, value]) => {
            if (value.includes(nodeId)) {
              return true
            }
          }) || {}

          const tlName = signalService.nodeIdToName(nodeId)
          this.add(nodeId, this.color, ooo[0], tlName)
        })
      } else if (this.type === 'group') {
        const nodIds = groupMap[groupId] || []

        nodIds.forEach(nodeId => {
          const tlName = signalService.nodeIdToName(nodeId)
          this.add(nodeId, this.color, groupId, tlName)
        })
      } else if (this.type === 'name') {
        const objs = this.geometries.filter(g => {
          return g.$crossName.includes(groupId)
        })
        objs.forEach(obj => {
          const nodeId = obj.$nodeId
          const ooo = Object.entries(groupMap).find(([key, value]) => {
            if (value.includes(nodeId)) {
              return true
            }
          }) || {}

          const tlName = signalService.nodeIdToName(nodeId)
          this.add(nodeId, this.color, ooo[0], tlName)
        })

      }

      // this.nodeId = ''
      // this.update()
    },
    addNode(groupId) {
      if (this.type === 'id') {
        const obj = this.geometries.find(g => g.$nodeId === groupId)
        if (obj) {
          this.add(groupId, this.color, null, obj.$crossName)
          this.update()
          this.nodeId = ''
        }
      } else if (this.type === 'group') {
        const nodIds = groupMap[groupId]
        if (nodIds) {
          nodIds.forEach(node => {
            const name = signalService.nodeIdToName(node)
            this.add(node, this.color, groupId, name)
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
      this.geometries.forEach(g => {
        const obj = this.selected.find(s => s.id === g.$nodeId)
        if (obj) {
          g.$groupId = obj.groupId
          g.updateSymbol([
            {
              markerFill: '#' + obj.color,
              markerWidth: 20,
              markerHeight: 20,
              textHaloFill: '#' + obj.color,
              textHaloRadius: 1,
              // textFill: '#' + obj.color,
              textName: `${obj.groupId}(${obj.name})`,
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
      console.log('map height:', this.mapHeight)
    },
    finishTlSelection() {
      this.$emit("selection:finished", {
        junctions: this.targetGroups,
      });
    }
  },

  async mounted() {
    this.groupOptions = Object.keys(groupMap).sort()
    this.map = makeMap({ mapId: this.mapId, zoom: 12 })

    if (this.height) {
      this.mapHeight = this.height
    }

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
            // textFill: 'white',
            // textHaloFill: 'blue',
            // textHaloRadius: 1,
            // textName: feature.target.$crossName + '[' + feature.target.$groupId + ']' || '',

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
              textName: `${e.target.$groupId}(${e.target.$nodeId})`
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
              textName: `${e.target.$groupId}(${e.target.$crossName})`
            }
          ])
        })
        .on('click', e => {
        })
      trafficLight.$crossName = crossName
      trafficLight.$nodeId = feature.properties.NODE_ID

      return trafficLight
    })

    const addLayer = addLayerTo(this.map)
    this.trafficLightsLayer = addLayer('trafficLightsLayer')
    this.trafficLightsLayer.addGeometry(this.geometries)
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
