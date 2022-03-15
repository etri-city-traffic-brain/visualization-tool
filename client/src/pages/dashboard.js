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
      console.log('map loaded')
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
      const res = axios({
        url: '/salt/v1/dashboard/dtg?date=' + this.dtgDate,
        method: 'get'
      })
        .then(res => res.data)
        .then(dtgData => {
          this.dtgData = dtgData
          this.updateDtg()
        })
    }
  },

  destroyed () {
    if (this.map) {
      this.map.remove()
    }
  }
}
