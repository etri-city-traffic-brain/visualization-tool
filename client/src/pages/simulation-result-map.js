/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */
import StepPlayer from '@/stepper/step-runner'
import stepperMixin from '@/stepper/mixin'

import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'

import WebSocketClient from '@/realtime/ws-client'
import simSvc from '@/service/simulation-service'
import SimulationResult from '@/pages/SimulationResult.vue'

import statisticsService from '@/service/statistics-service'
import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'
import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqMapChanger from '@/components/UniqMapChanger'

import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import userState from '@/user-state'
import region from '@/map2/region'
import map from '@/region-code'

// import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'
// import HistogramChart from '@/components/charts/HistogramChart'
// import Doughnut from '@/components/charts/Doughnut'
// import BarChart from '@/components/charts/BarChart'
// import D3SpeedBar from '@/charts/d3/D3SpeedBar'
// import axios from 'axios'
// import * as d3 from 'd3'
// import * as R from 'ramda'
// import D3SpeedBar from '../charts/d3/D3SpeedBar.vue';
// import bins from '@/stats/histogram'
// import config from '@/stats/config'
// import { labels } from '../utils/color-of-congestion'

const defaultOption = (xTitle = '', yTitle) => ({
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
        scaleLabel: {
          display: true,
          labelString: xTitle,
          fontColor: 'white'
        },
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
        scaleLabel: {
          display: true,
          labelString: yTitle || '속도(km/h)',
          fontColor: 'white'
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 20,
          maxRotation: 0,
          display: true,
          fontColor: 'white',
          callback: function (value, index, ticks) {
            return value
            // return value + ' km/h'
          }
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

function makeLinkCompChart (data) {
  // console.log(data)
  const ll = data.map(d => d.data.length)
  const maxValue = Math.max(...ll)
  const minValue = Math.min(...ll)

  const maxIdx = data.findIndex(d => d.data.length === maxValue)

  // console.log('maxIdx:', maxIdx)
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 1,
    data
  })
  const labels = new Array(data[maxIdx].data.length)
    .fill(0)
    .map((_, i) => i + '')
  const datasets = data.map(d => {
    return dataset(d.label, d.color, d.data.slice(0, minValue))
  })
  return {
    labels: labels.slice(0, minValue),
    datasets
  }
}

// function stepToTime (step, startTime, periodSec) {
//   const hourStart = startTime.substring(0, 2)
//   const periodMin = periodSec / 60
//   let hour = Number(hourStart) - 1
//   if (step % 60 === 0) {
//     hour += 1
//   }
//   const hh = (hour + '').padStart(2, '0')
//   const mm = ((step % 60) + '').padStart(2, '0')
//   const r = hh + ':' + mm
//   return
// }

const makeLinkSpeedChartData = (data1, startTime, periodSec) => {
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 1,
    data
  })

  const hourStart = startTime.substring(0, 2)
  const periodMin = periodSec / 60

  let hour = Number(hourStart) - 1
  const labels = []
  for (let i = 0, j = 0; i < data1.length; i++, j += periodMin) {
    if (j % 60 === 0) {
      hour += 1
    }
    const hh = (hour + '').padStart(2, '0')
    const mm = ((j % 60) + '').padStart(2, '0')
    const r = hh + ':' + mm

    labels.push(r)
  }

  return {
    labels: labels,
    datasets: [dataset('링크속도', '#7FFFD4', data1)]
  }
}

const { log } = console

export default {
  name: 'SimulationResultMap',
  components: {
    SimulationResult,
    SimulationDetailsOnRunning,
    SimulationDetailsOnFinished,
    LineChart,
    UniqCongestionColorBar,
    UniqMapChanger
  },
  data () {
    return {
      defaultOption,
      userState,
      simulationId: null,
      simulation: { configuration: {} },
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      // mapHeight: 1024, // map view height
      mapHeight: 600, // map view height
      mapManager: null,
      speedsPerStep: {},
      sidebar: false,
      sidebarRse: false,
      currentStep: 0,
      slideMax: 0,
      showLoading: false,
      congestionColor,
      currentEdge: null,
      currentEdgeSpeed: 0,
      playBtnToggle: false,
      player: null,
      wsClient: null,
      chart: {
        linkMeanSpeeds: [],
        linkSpeeds: [],
        linkVehPassed: [],
        linkWaitingTime: [],
        links: [],
        pieData: [],
        pieDataStep: []
      },
      // currentZoom: '',
      // currentExtent: '',
      // wsStatus: 'ready',
      avgSpeed: 0.0,
      linkHover: '',
      progress: 0,
      focusData: {
        speed: 0.0
      },
      logs: [],

      showWaitingMsg: false,
      speedsByEdgeId: {},
      statusText: ''
    }
  },
  destroyed () {
    if (this.map) {
      this.map.remove()
    }
    if (this.stepPlayer) {
      this.stepPlayer.stop()
    }
    if (this.wsClient) {
      this.wsClient.close()
    }
    window.removeEventListener('resize', this.resize.bind(this))
  },
  computed: {
    config () {
      return this.simulation.configuration
    }
  },
  async mounted () {
    this.simulationId = this.$route.params ? this.$route.params.id : null
    this.showLoading = true

    this.map = makeMap({ mapId: this.mapId, zoom: 16 })

    setTimeout(() => this.centerTo(), 1000)
    await this.updateSimulation()
    this.resize()

    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this
    })

    this.mapManager.loadMapData()
    if (this.simulation.status === 'finished') {
      await this.updateChart()
    }
    this.wsClient = WebSocketClient({
      simulationId: this.simulationId,
      eventBus: this
    })
    this.wsClient.init()

    this.showLoading = false

    this.$on('link:selected', link => {
      this.currentEdge = link
      // if (link.speeds) {
      // if (!this.speedsPerStep.datasets) {

      // }
      // this.chart.linkMeanSpeeds = makeLinkSpeedChartData(
      //   this.speedsPerStep.datasets[0].data,
      //   this.simulation.configuration.fromTime,
      //   this.simulation.configuration.period
      // )
      // }

      this.updateLinkChart(link.LINK_ID, link.vdsId)
    })

    this.$on('link:hover', link => {
      this.linkHover = link.LINK_ID
    })

    this.$on('salt:data', d => {
      this.avgSpeed =
        d.roads
          .map(road => road.speed)
          .reduce((acc, cur) => {
            acc += cur
            return acc
          }, 0) / d.roads.length
      this.speedsByEdgeId = d.roads.reduce((acc, road) => {
        acc[road.roadId.trim()] = road
        return acc
      }, {})
    })

    this.$on('salt:status', async status => {
      this.addLog(`status: ${status.status}, progress: ${status.progress}`)
      this.progress = status.progress
      if (status.progress >= 99) {
        this.showWaitingMsg = true
      }
    })

    this.$on('salt:finished', async () => {
      try {
        await this.updateSimulation()
        await this.updateChart()
      } catch (err) {
        log(err)
      } finally {
        this.showWaitingMsg = false
        this.simulation.status = 'finished'
        this.showModal()
        this.resize()
      }
    })

    // this.$on('map:moved', ({ zoom, extent }) => {})
    // this.$on('ws:open', () => {})
    // this.$on('ws:error', () => {})
    // this.$on('ws:close', () => {})

    window.addEventListener('resize', this.resize.bind(this))
  },
  methods: {
    showModal () {
      this.$refs.simmodal.show()
    },
    hideModal () {
      this.$refs.simmodal.hide()
    },
    startReplay () {
      this.wsClient.send({
        simulationId: this.simulationId,
        type: 'replay',
        command: 'start',
        step: 0
      })
    },
    stopReplay () {
      this.wsClient.send({
        simulationId: this.simulationId,
        type: 'replay',
        command: 'stop',
        step: 0
      })
    },
    ...stepperMixin,

    async startSimulation () {
      log('start simulation')
      this.simulation.status = 'running'
      this.resize()
      try {
        await simSvc.startSimulation(this.simulationId, this.userState.userId)
        log('end')
      } catch (err) {
        log(err)
        this.statusText = err.message
      }
      setTimeout(() => this.updateSimulation(), 5000)
    },

    stop () {
      this.$emit('salt:stop', this.simulationId)
      simSvc.stopSimulation(this.simulationId).then(() => {
        this.updateSimulation()
      })
    },
    addLog (text) {
      this.logs.push(`${new Date().toLocaleTimeString()} ${text}`)
      if (this.logs.length > 5) {
        this.logs.shift()
      }
    },
    toggleFocusTool () {
      this.mapManager.toggleFocusTool()
    },
    toggleState () {
      return this.playBtnToggle ? '중지' : '시작'
    },
    async updateSimulation () {
      const { simulation, ticks } = await simSvc.getSimulationInfo(
        this.simulationId
      )
      this.simulation = simulation
      this.slideMax = ticks - 1
    },
    async updateChart () {
      this.stepPlayer = StepPlayer(this.slideMax, this.stepForward.bind(this))
      this.chart.histogramDataStep = await statisticsService.getHistogramChart(
        this.simulationId,
        0
      )
      this.chart.histogramData = await statisticsService.getHistogramChart(
        this.simulationId
      )
      this.chart.pieDataStep = await statisticsService.getPieChart(
        this.simulationId,
        0
      )
      this.chart.pieData = await statisticsService.getPieChart(
        this.simulationId
      )
      this.speedsPerStep = await statisticsService.getSummaryChart(
        this.simulationId
      )

      // this.pieData = await statisticsService.getPieChart(this.simulationId)
      // this.pieDataStep = await statisticsService.getPieChart(
      //   this.simulationId,
      //   0
      // )

      this.chart.linkMeanSpeeds = makeLinkSpeedChartData(
        this.speedsPerStep.datasets[0].data,
        this.simulation.configuration.fromTime,
        this.simulation.configuration.period
      )
    },
    edgeSpeed () {
      if (this.currentEdge && this.currentEdge.speeds) {
        return this.currentEdge.speeds[this.currentStep] || 0
      }
      return 0
    },
    resize () {
      // this.mapHeight = window.innerHeight - 150 // update map height to current height
      if (this.simulation.status === 'finished') {
        this.mapHeight = window.innerHeight - 350 // update map height to current height
      } else {
        this.mapHeight = window.innerHeight - 170 // update map height to current height
      }
    },
    togglePlay () {
      if (this.currentStep >= this.slideMax) {
        this.currentStep = 0
      }
      this.playBtnToggle = !this.playBtnToggle
      ;(this.playBtnToggle ? this.stepPlayer.start : this.stepPlayer.stop).bind(
        this
      )()
    },
    async stepChanged (step) {
      setTimeout(() => {
        if (step >= this.slideMax) {
          this.currentStep = 0
        }
      }, 2000)

      if (this.simulation.status === 'finished') {
        this.mapManager.changeStep(step)
        this.chart.pieDataStep = await statisticsService.getPieChart(
          this.simulationId,
          step
        )
        this.chart.histogramDataStep =
          await statisticsService.getHistogramChart(this.simulationId, step)
      }
    },
    centerTo () {
      if (this.config.areaType === 'area') {
        const center = [this.config.area.minX, this.config.area.minY]
        this.map.animateTo({ center, zoom: 15 }, { duration: 1000 })
        return
      }
      const center = region[this.config.region] || region.doan
      this.map.animateTo({ center, zoom: 15 }, { duration: 1000 })
    },
    makeToast (msg, variant = 'info') {
      this.$bvToast.toast(msg, {
        title: 'Notification',
        autoHideDelay: 5000,
        appendToast: false,
        variant,
        toaster: 'b-toaster-bottom-right'
      })
    },
    async connectWebSocket () {
      this.wsClient.init()
    },
    getRegionName (r) {
      return map[r] || r
    },
    removeLinkChart (linkId) {
      const idx = this.chart.links.findIndex(obj => obj.linkId === linkId)
      if (idx >= 0) {
        this.chart.links.splice(idx, 1)
      }
    },
    async updateLinkChart (linkId, vdsId) {
      try {
        const linkData = await simSvc.getValueByLinkOrCell(
          this.simulationId,
          linkId
        )

        this.chart.linkSpeeds = makeLinkCompChart([
          { label: 'simulation', color: '#FF8C00', data: linkData.values }
        ])

        this.chart.linkVehPassed = makeLinkCompChart([
          { label: 'simulation', color: '#7FFF00', data: linkData.vehPassed }
        ])
      } catch (err) {
        log(err.message)
      }
    }
  }
}
