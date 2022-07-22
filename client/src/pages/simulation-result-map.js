/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */
import StepPlayer from '@/stepper/step-runner'
import stepperMixin from '@/stepper/mixin'
// import * as d3 from 'd3'
import * as R from 'ramda'
import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'

import WebSocketClient from '@/realtime/ws-client'

import simulationService from '@/service/simulation-service'

import SimulationResult from '@/pages/SimulationResult.vue'

import HistogramChart from '@/components/charts/HistogramChart'
import Doughnut from '@/components/charts/Doughnut'
import statisticsService from '@/service/statistics-service'
import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import UniqMapChanger from '@/components/UniqMapChanger'

import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'
import D3SpeedBar from '@/charts/d3/D3SpeedBar'
import axios from 'axios'
// import D3SpeedBar from '../charts/d3/D3SpeedBar.vue';
import bins from '@/stats/histogram'
import userState from '@/user-state'
import region from '@/map2/region'
import config from '@/stats/config'
import map from '@/region-code'
const pieDefault = () => ({
  datasets: [
    {
      data: [1, 1, 1],
      backgroundColor: ['red', 'orange', 'green']
    }
  ],
  labels: ['막힘', '정체', '원활']
})

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

const makeLineChart = (data, label, color) => {
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 1,
    data
  })

  return {
    labels: new Array(data.length).fill(0).map((_, i) => i),
    datasets: [
      dataset(label, color, data)
      // dataset('평균속도', '#1E90FF', data2)
      // dataset('제한속도', '#FF0000', data3),
    ]
  }
}

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
  const labels = new Array(data[maxIdx].data.length).fill(0).map((_, i) => i)
  const datasets = data.map(d => {
    return dataset(d.label, d.color, d.data.slice(0, minValue))
  })
  return {
    labels: labels.slice(0, minValue),
    datasets
  }
}

const makeLinkSpeedChartData = (data1, data2, data3) => {
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 1,
    data
  })

  return {
    labels: new Array(data1.length).fill(0).map((_, i) => i),
    datasets: [
      dataset('링크속도', '#7FFFD4', data1)
      // dataset('평균속도', '#1E90FF', data2)
      // dataset('제한속도', '#FF0000', data3),
    ]
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
    BarChart,
    HistogramChart,
    Doughnut,
    UniqCongestionColorBar,
    UniqSimulationResultExt,
    UniqMapChanger,
    D3SpeedBar
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
      playBtnToggle: false,
      player: null,
      wsClient: null,
      chart: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkMeanSpeeds: [],
        linkSpeeds: [],
        linkVehPassed: [],
        linkWaitingTime: [],
        links: []
      },
      currentZoom: '',
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0.0,
      linkHover: '',
      progress: 0,
      focusData: {
        speed: 0.0
      },
      avgSpeedView: pieDefault(),
      avgSpeedFocus: pieDefault(),
      logs: [],
      bottomStyle: {
        height: '220px',
        borderRadius: '0px',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'fixed',
        bottom: 0,
        width: '100%'
      },
      playerStyle: {
        // width: '300px',
        // bottom: '150px'
        // zIndex: 999,
        // position: 'fixed',
        // top: '50px',
        // right: '10px'
      },
      vdsList: {},
      rseList: {
        RSE1501RSE1504: ['-563111309', '-563105261', '-563105256', '563108468'],
        RSE1501RSE1505: [
          '563105249',
          '-563108169',
          '563108170',
          '563108165',
          '-563104339',
          '-563105246',
          '-563105250',
          '-563104128'
        ]
      },
      showWaitingMsg: false
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

    // this.resize()
    this.map = makeMap({ mapId: this.mapId, zoom: 16 })

    await this.updateSimulation()

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

    const res = await axios({
      url: '/salt/v1/vds',
      method: 'get'
    })
    this.vdsList = res.data

    this.$on('link:selected', async link => {
      this.currentEdge = link
      if (link.speeds) {
        if (!this.speedsPerStep.datasets) {
          //
        }
        // this.chart.linkSpeeds = makeLinkSpeedChartData(
        //   link.speeds,
        //   this.speedsPerStep.datasets[0].data,
        //   new Array(link.speeds.length).fill(this.edgeSpeed())
        // )

        this.chart.linkMeanSpeeds = makeLinkSpeedChartData(
          this.speedsPerStep.datasets[0].data,
          new Array(this.speedsPerStep.datasets[0].data.length).fill(
            this.edgeSpeed()
          ),
          []
        )
      }

      await this.updateLinkChart(link.LINK_ID, link.vdsId)
    })

    this.$on('link:hover', link => {
      this.linkHover = link.LINK_ID
    })

    this.$on('salt:data', d => {
      // console.log('salt:data', d)
      this.avgSpeed =
        d.roads
          .map(road => road.speed)
          .reduce((acc, cur) => {
            acc += cur
            return acc
          }, 0) / d.roads.length

      this.avgSpeedView = {
        datasets: [
          {
            data: bins(d.roads).map(R.prop('length')),
            backgroundColor: config.colorsOfSpeed2
          }
        ],
        labels: config.speeds
      }
    })

    this.$on('salt:status', async status => {
      this.addLog(`status: ${status.status}, progress: ${status.progress}`)
      this.progress = status.progress
      if (status.progress >= 99) {
        // FINISHED
        this.showWaitingMsg = true
      }
    })

    this.$on('map:focus', data => {
      this.focusData = data
      this.avgSpeedFocus = {
        datasets: [
          {
            data: bins(data.realTimeEdges).map(R.prop('length')),
            backgroundColor: config.colorsOfSpeed2
          }
        ],
        labels: config.speeds
      }
      // console.log(bins(data.realTimeEdges))
      // console.log(data.realTimeEdges)
    })

    this.$on('salt:finished', async () => {
      log('**** SIMULATION FINISHED *****')

      try {
        await this.updateSimulation()
        await this.updateChart()
      } catch (err) {
        log(err)
      } finally {
        this.showWaitingMsg = false
        this.simulation.status = 'finished'
      }
    })

    this.$on('map:moved', ({ zoom, extent }) => {
      this.currentZoom = zoom
      this.currentExtent = [extent.min, extent.max]
    })

    this.$on('ws:open', () => {
      this.wsStatus = 'open'
    })

    this.$on('ws:error', () => {
      this.wsStatus = 'error'
      this.makeToast('ws connection error', 'warning')
    })

    this.$on('ws:close', () => {
      this.wsStatus = 'close'
      // this.makeToast('ws connection closed', 'warning')
    })

    window.addEventListener('resize', this.resize.bind(this))
  },
  methods: {
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
      this.simulation.status = 'running'
      try {
        await simulationService.startSimulation(
          this.simulationId,
          this.userState.userId
        )
      } catch (err) {
        console.log(err)
      }
    },

    stop () {
      this.$emit('salt:stop', this.simulationId)
      simulationService.stopSimulation(this.simulationId).then(() => {
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
      const { simulation, ticks } = await simulationService.getSimulationInfo(
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
      this.chart.linkMeanSpeeds = makeLinkSpeedChartData(
        this.speedsPerStep.datasets[0].data,
        new Array(this.speedsPerStep.datasets[0].data.length).fill(
          this.edgeSpeed()
        ),
        []
      )
    },
    edgeSpeed () {
      if (this.currentEdge && this.currentEdge.speeds) {
        return this.currentEdge.speeds[this.currentStep] || 0
      }
      return 0
    },
    resize () {
      // this.mapHeight = window.innerHeight - 220; // update map height to current height
      // this.mapHeight = window.innerHeight - 160 // update map height to current height
      // this.mapHeight = window.innerHeight - 250 // update map height to current height
    },
    togglePlay () {
      // console.log(this.currentStep, this.slid)
      // console.log(this.currentStep, this.slideMax)
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
        this.chart.histogramDataStep = await statisticsService.getHistogramChart(
          this.simulationId,
          step
        )
      }
    },
    centerTo (locationCode) {
      const center = region[locationCode] || region[1]
      this.map.animateTo({ center }, { duration: 2000 })
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
      // const map = {
      //   yuseonggu: '유성구',
      //   seogu: '서구',
      //   doan: '도안'
      // }
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
        const linkData = await simulationService.getValueByLinkOrCell(
          this.simulationId,
          linkId
        )
        // this.chart.linkSpeeds = makeLineChart(linkData.values, '링크속도', 'skyblue')
        // this.chart.linkSpeeds = makeLinkSpeedChartData(linkData.values, [10, 20, 30, 10, 20, 30])
        // const vdsSpeedData = { label: 'vds', color: 'skyblue', data: [] }
        let vdsD = [[]]
        if (vdsId) {
          const res = await axios({
            url: '/salt/v1/vds/volume/' + vdsId,
            method: 'get'
          })
          // console.log(vdsId, '--', res.data)
          vdsD = res.data
          // vdsSpeedData.data = vdsD.map(v => v[1])
          this.chart.linkSpeeds = makeLinkCompChart([
            { label: 'simulation', color: '#FF8C00', data: linkData.values },
            { label: 'vds', color: 'skyblue', data: vdsD.map(v => v[1]) }
          ])
        } else {
          this.chart.linkSpeeds = makeLinkCompChart([
            { label: 'simulation', color: '#FF8C00', data: linkData.values },
            {
              label: 'vds',
              color: 'skyblue',
              data: new Array(linkData.values.length).fill(0)
            }
          ])
        }
        console.log(linkData.values)
        const e = this.chart.links.findIndex(v => v.linkId === linkId)
        if (e < 0) {
          this.chart.links.push({
            linkId,
            speeds: makeLineChart(linkData.values, 'simulation', 'skyblue')
          })
        }

        // const vdsVolumeData = { label: 'vds', color: '#8FBC8F', data: [] }
        let vdsD2 = [[]]
        if (vdsId) {
          const res = await axios({
            url: '/salt/v1/vds/speed/' + vdsId,
            method: 'get'
          })
          vdsD2 = res.data
          // vdsVolumeData.data = vdsD.map(v => v[1])
          // console.log('--', res.data)
          this.chart.linkVehPassed = makeLinkCompChart([
            { label: 'simulation', color: '#7FFF00', data: linkData.vehPassed },
            { label: 'vds', color: '#8FBC8F', data: vdsD2.map(v => v[1]) }
          ])
        } else {
          this.chart.linkVehPassed = makeLinkCompChart([
            { label: 'simulation', color: '#7FFF00', data: linkData.vehPassed },
            {
              label: 'vds',
              color: '#8FBC8F',
              data: new Array(linkData.vehPassed.length).fill(0)
            }
          ])
          // data: new Array(linkData.vehPassed.length).fill(0)
        }
      } catch (err) {
        console.log(err.message)
      }

      // this.chart.linkVehPassed = makeLineChart(linkData.vehPassed, '통과차량', 'blue')
      // this.chart.linkWaitingTime = makeLineChart(linkData.waitingTime, '대기시간', 'red')
    },
    async goToLink (linkId) {
      const res = await axios({
        method: 'get',
        url: `/salt/v1/map/links/${linkId}`
      })
      const link = res.data
      this.map.animateTo({
        center: link.geometry.coordinates[0]
      })
    },
    async goToRse (rseId) {
      const link0 = this.rseList[rseId][0]
      const res = await axios({
        method: 'get',
        url: `/salt/v1/map/links/${link0}`
      })
      const link = res.data
      this.map.animateTo({
        center: link.geometry.coordinates[0]
      })
      this.mapManager.showRse(rseId, this.rseList[rseId])
    }
  }
}
