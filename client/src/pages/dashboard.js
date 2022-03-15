import * as THREE from 'three'
import * as maptalks from 'maptalks'
import { ThreeLayer, BaseObject } from 'maptalks.three'
import { MeshLineMaterial } from '../dashboard/THREE.MeshLine.js'
import SpriteLine from '../dashboard/sprite-line.js'

// import { BaseObject } from 'maptalks.three'

import axios from 'axios'
import * as R from 'ramda'
import * as d3 from 'd3'
// import * as d3 from 'd3'
import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'
import LineChart from '@/components/charts/LineChart'

const defaultOption = () => ({
  responsive: true,
  title: {
    display: false,
    text: 'Line Chart'
  },
  tooltips: {
    mode: 'index',
    intersect: false
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
  scales: {
    xAxes: [
      {
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
          display: true,
          fontColor: 'white'
        }
      }
    ],
    yAxes: [
      {
        ticks: {
          autoSkip: true,
          autoSkipPadding: 10,
          maxRotation: 0,
          display: true,
          fontColor: 'white'
        }
      }
    ]
  },
  legend: {
    display: true,
    labels: {
      fontColor: 'white',
      fontSize: 12
    }
  }
})

const { log, warn } = console
const color = d3
  .scaleLinear()
  .domain([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 40])
  .range([
    'rgb(244, 225, 83)',
    'rgb(248, 191, 79)',
    'rgb(243, 159, 83)',
    'rgb(230, 130, 89)',
    'rgb(209, 104, 95)',
    'rgb(183, 84, 99)',
    'rgb(152, 67, 98)',
    'rgb(119, 55, 93)',
    'rgb(85, 44, 82)',
    'rgb(54, 33, 66)'
  ])
  .interpolate(d3.interpolateHcl)

const makeLinkSpeedChartData = (data1, data2, data3) => {
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 0.5,
    pointRadius: 1,
    data
  })

  return {
    labels: new Array(data1.length).fill(0).map((_, i) => i),
    datasets: [
      dataset('속도', '#7FFFD4', data1),
      dataset('볼륨', '#1E90FF', data2)
    ]
  }
}

// three.js
const tiles = {}

const makeId = tile => tile.idx + '_' + tile.idy
const { requestAnimationFrame, fetch } = window

const urlTemplateBuildings = (x, y) =>
  `https://data.osmbuildings.org/0.2/anonymous/tile/15/${x}/${y}.json`
function getColor (height) {
  let rgb
  if (height < 61.4) {
    rgb = '112,112,123'
  } else if (height >= 61.4 && height < 104.8) {
    rgb = '135,139,155'
  } else if (height >= 104.8 && height < 148.2) {
    rgb = '231,241,245'
  } else if (height >= 148.2 && height < 236) {
    rgb = '162,169,183'
  } else {
    rgb = '1,0,0'
  }
  return `rgb(${rgb})`
}

function loadBuildings (map, threeLayer) {
  const tilesNew = map.getBaseLayer().getTiles(15).tileGrids[0].tiles
  const tilesWillBeAdded = []
  const tilesWillBeDeleted = []
  const meshWillBeDeleted = []

  Object.values(tiles).forEach(tileOld => {
    const result = tilesNew.find(tileNew => makeId(tileOld) === makeId(tileNew))

    if (!result) {
      tilesWillBeDeleted.push(tileOld)
    }
  })

  tilesNew.forEach(tile => {
    if (makeId(tile) in tiles) {
      // exists
    } else {
      tilesWillBeAdded.push(tile)
    }
  })

  tilesWillBeAdded.forEach(tile => (tiles[makeId(tile)] = tile))
  tilesWillBeDeleted.forEach(tile => delete tiles[makeId(tile)])

  threeLayer.getMeshes().forEach(mesh => {
    tilesWillBeDeleted.some(tile => {
      if (makeId(tile) === mesh.$id) {
        meshWillBeDeleted.push(mesh)
        return true
      }
      return false
    })
  })

  threeLayer.removeMesh(meshWillBeDeleted)

  tilesWillBeAdded.forEach(tile => {
    window
      .fetch(urlTemplateBuildings(tile.x, tile.y))
      .then(response => response.json())
      .then(data => data.features)
      .then(features => {
        features.forEach(function (g) {
          const heightPerLevel = 20
          const levels = g.properties.levels || 2

          const material = new THREE.MeshPhongMaterial({
            color: getColor(levels)
          })

          const mesh = threeLayer.toExtrudePolygon(
            maptalks.GeoJSON.toGeometry(g),
            {
              interactive: false,
              height: levels * heightPerLevel,
              topColor: '#bbb'
            },
            material
          )

          mesh.$id = makeId(tile)
          threeLayer.addMesh(mesh)
        })
      })
      .catch(() => {
        // console.log('err', err)
        // ignore
      })
  })
}
function makeRoadTexture (url) {
  const texture = new THREE.TextureLoader().load(url)
  console.log(texture)
  texture.anisotropy = 16
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}
function loadRoad (mapManager, threeLayer, geojsonURL) {
  // fetch(geojsonURL)

  const gs = mapManager.getCurrentLinks()

  const links = gs
  const features = links.map(link => link.toGeoJSON())
  const geojson = {
    type: 'FeatureCollection',
    features: []
  }
  geojson.features = features
  // .then(res => res.json())

  // eslint-disable-next-line no-undef
  const env = process && process.env
  let mediumT, highT, lowT
  if (env.NODE_ENV === 'development') {
    mediumT = makeRoadTexture('http://localhost:8080/public/road1.png')
    highT = makeRoadTexture('http://localhost:8080/public/road2.png')
    lowT = makeRoadTexture('http://localhost:8080/public/road3.png')
  } else {
    mediumT = makeRoadTexture('/public/road1.png')
    highT = makeRoadTexture('/public/road2.png')
    lowT = makeRoadTexture('/public/road3.png')
  }

  const camera = threeLayer.getCamera()
  const getTexture = speed => {
    if (speed < 50) {
      console.log(speed)
      return lowT
    }
    if (speed >= 50 && speed <= 60) {
      return mediumT
    } else {
      return highT
    }
  }

  const multiLineStrings = maptalks.GeoJSON.toGeometry(geojson)

  for (const multiLineString of multiLineStrings) {
    const speed = multiLineString.properties.SPEEDLH

    if (speed < 30) {
      // continue
    }
    const material = new MeshLineMaterial({
      map: getTexture(speed),
      useMap: true,
      lineWidth: 10,
      sizeAttenuation: false,
      transparent: true,
      near: camera.near,
      far: camera.far
    })

    const line = new SpriteLine(
      multiLineString,
      {
        altitude: 0,
        // speed: (1 / multiLineStrings.length) * (cnt > 100 ? 0.0 : 100)
        speed: 5
        // speed: (1 / multiLineStrings.length) * speed * 20 * 100
        // speed: 10
      },
      material,
      threeLayer
    )

    threeLayer.addMesh(line)
  }
}
function initThree (map, mapManager) {
  const threeLayer = new ThreeLayer('t', {
    forceRenderOnMoving: true,
    forceRenderOnRotating: true
    // animation: true
  })

  threeLayer.prepareToDraw = function (gl, scene, camera) {
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    camera.add(new THREE.SpotLight(0xffffff, 0.6, 0, Math.PI))

    loadBuildings(map, threeLayer)
    setTimeout(() => {
      loadRoad(mapManager, threeLayer, './data/salt-links.geojson')
    }, 1000)
    animation()
  }

  threeLayer.addTo(map)

  function animation () {
    // layer animation support Skipping frames
    threeLayer._needsUpdate = !threeLayer._needsUpdate
    if (threeLayer._needsUpdate) {
      threeLayer.redraw()
    }
    requestAnimationFrame(animation)
  }
}

//

export default {
  name: 'Dashboard',
  components: {
    LineChart
  },
  data () {
    return {
      showVds: false,
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      mapHeight: 1024, // map view height
      mapManager: null,
      dtgData: {},
      dtgDate: '2019-08-01',
      videoUrl: '',
      cctv: {},
      isRunning: false,
      chart: { vds: [] }
    }
  },
  async mounted () {
    this.$on('link:selected', async link => {
      const vdsId = link.vdsId
      const vdsSpeedData = { label: 'vds', color: 'skyblue', data: [] }
      if (vdsId) {
        const res1 = await axios({
          url: '/salt/v1/vds/speed/' + vdsId,
          method: 'get'
        })
        const res2 = await axios({
          url: '/salt/v1/vds/volume/' + vdsId,
          method: 'get'
        })

        this.chart.vds = []
        const days = ['', 'fri', 'sat', 'wed', 'thu', 'sun', 'tue', 'mon']
        for (let i = 1; i < 8; i++) {
          const vdsSpeed = res1.data.map(v => v[i])
          const vdsVolume = res2.data.map(v => v[i])

          this.chart.vds.push({
            title: vdsId,
            day: days[i],
            chartDataset: makeLinkSpeedChartData(vdsSpeed, vdsVolume)
          })
        }
        this.showVds = true
      }
    })
    this.map = makeMap({ mapId: this.mapId, zoom: 15 })
    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this
    })

    initThree(this.map, this.mapManager)
    console.log('mounted dashboard')

    this.$on('cctv:selected', cctv => {
      this.videoUrl = null
      setTimeout(() => {
        this.videoUrl = cctv.videoUrl
        this.cctv = cctv
        this.showModal()
      }, 200)
    })
    this.mapManager.loadMapData()
    this.$on('map:loaded', () => {
      log('map loaded')
      this.updateDtg()
    })

    axios({
      url: '/salt/v1/rse',
      method: 'get'
    })
      .then(res => res.data)
      .then(data => {
        // console.log(data)
      })
  },
  methods: {
    defaultOption,
    showModal () {
      // this.$refs['cctv-modal'].show()
    },
    hideModal () {
      this.$refs['cctv-modal'].hide()
    },
    updateDtg () {
      const links = this.mapManager.getCurrentLinks()

      links.forEach(link => {
        const v = this.dtgData[link.properties.LINK_ID] || -1
        if (v > 0) {
          link.properties.altitude = v / 10
          link.updateSymbol({
            lineWidth: v / 100,
            lineColor: color(v / 50)
          })
        }
      })
    },
    analizeDtg () {
      axios({
        url: `/salt/v1/dashboard/dtg?date=${this.dtgDate}`,
        method: 'get'
      })
        .then(res => res.data)
        .then(dtgData => {
          this.dtgData = dtgData
          this.updateDtg()
        })
        .catch(err => {
          warn(err.message)
        })
    }
  },

  destroyed () {
    if (this.map) {
      this.map.remove()
    }
  }
}
