import axios from 'axios'
import * as d3 from 'd3'
import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'
import LineChart from '@/components/charts/LineChart'

import {
  loadBuildings,
  loadLinks,
  loadLineTrip,
  initThree
} from '../dashboard/loader.js'

import {
  defaultOption,
  color,
  makeLinkSpeedChartData
} from '../dashboard/dtg-stats.js'

export default {
  name: 'Dashboard',
  components: {
    LineChart
  },
  data() {
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
      // isRunning: false,
      chart: { vds: [] },
      threeLayer: {},
      dtgShow: true,
      lineTrips: [],
      useBuilding: false,
      buildings: [],
      useLinks: false,
      useTrip: false,
      links: []
    }
  },
  watch: {
    useTrip: function (use) {
      if (use) {
        loadLineTrip(this)
        this.useTrip = true
      } else {
        this.threeLayer.removeMesh(this.lineTrips)
      }
    },
    useBuilding: function (use) {
      if (use) {
        this.tiles = {}
        loadBuildings(this.map, this.threeLayer, this)
      } else {
        this.threeLayer.removeMesh(this.buildings)
      }
    },
    useLinks: function (use) {
      if (use) {
        loadLinks(this.mapManager, this.threeLayer, this)
      } else {
        this.threeLayer.removeMesh(this.links)
      }
    }
  },
  mounted() {
    this.$on('link:selected', async link => {
      console.log('link:selected', link)
      this.loadVdsStats(link)
    })
    this.map = makeMap({ mapId: this.mapId, zoom: 15 })
    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this,
      useSaltLink: true
    })
    this.map.on('zoomEnd', () => {
      this.analizeDtg()
    })
    this.map.on('moveEnd', () => {
      this.analizeDtg()
    })

    this.threeLayer = initThree(this.map)

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
      // if (this.useBuilding) {
      //   loadBuildings(this.map, this.threeLayer, this)
      // }
      // if (this.useLinks) {
      //   loadLinks(this.mapManager, this.threeLayer, this)
      // }
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
    async loadVdsStats(link) {
      const vdsId = link.vdsId
      if (!vdsId) return

      const res1 = await axios({
        url: '/salt/v1/vds/speed/' + vdsId,
        method: 'get'
      }).then(res => res.data)
      const res2 = await axios({
        url: '/salt/v1/vds/volume/' + vdsId,
        method: 'get'
      }).then(res => res.data)

      this.chart.vds = []
      const days = ['', 'fri', 'sat', 'wed', 'thu', 'sun', 'tue', 'mon']
      for (let i = 1; i < 8; i++) {
        const vdsSpeed = res1.map(v => v[i])
        const vdsVolume = res2.map(v => v[i])

        this.chart.vds.push({
          title: vdsId,
          day: days[i],
          chartDataset: makeLinkSpeedChartData(vdsSpeed, vdsVolume)
        })
      }
      this.showVds = true
    },
    showModal() {
      // this.$refs['cctv-modal'].show()
    },
    hideModal() {
      this.$refs['cctv-modal'].hide()
    },
    loadLinks() {
      loadLinks(this.mapManager, this.threeLayer)
    },
    updateDtg() {
      if (!this.dtgShow) return
      const links = this.mapManager.getCurrentLinks()

      links.forEach(link => {
        const v = this.dtgData[link.properties.LINK_ID] || -1
        if (v > 0) {
          link.properties.altitude = v / 10
          link.updateSymbol({
            lineWidth: v / 200,
            // lineWidth: v / 150,
            lineColor: color(v / 50),
            // textName: v,
            // textFill: color(v / 50),
            lineJoin: 'round', //miter, round, bevel
            lineCap: 'round', //butt, round, square
            lineOpacity: 0.8
            // textDx: 120
          })
          link.setInfoWindow({
            title: '차량 통행량',
            content: '통행량: ' + v + '대'
          })
        }
      })
    },

    hideDtg() {
      this.dtgShow = false
      const links = this.mapManager.getCurrentLinks()

      links.forEach(link => {
        const v = this.dtgData[link.properties.LINK_ID] || -1
        if (v > 0) {
          link.properties.altitude = 0
          link.updateSymbol({
            lineWidth: 0,
            lineColor: color(v / 50)
          })
        }
      })
    },

    analizeDtg() {
      this.dtgShow = true
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
    },

    loadLineTrail(num) {
      loadLineTrip(this, num)
      this.useTrip = true
    }
  },

  destroyed() {
    if (this.map) {
      this.map.remove()
    }

    if (this.threeLayer) {
      this.threeLayer.remove()
    }
  }
}
