/* eslint-disable no-unused-expressions */

import * as R from 'ramda'

import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'
import WebSocketClient from '@/realtime/ws-client'
import SimulationResult from '@/pages/SimulationResult.vue'
import bins from '@/stats/histogram'
import config from '@/stats/config'
import { optimizationService, simulationService } from '@/service'

import HistogramChart from '@/components/charts/HistogramChart'
import Doughnut from '@/components/charts/Doughnut'
import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import UniqMapChanger from '@/components/UniqMapChanger'
import UniqCardTitle from '@/components/func/UniqCardTitle'
import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'

import lineChartOption from '@/charts/chartjs/line-chart-option'
// import donutChartOption from '@/charts/chartjs/donut-chart-option';
import makeRewardChartData from '@/charts/chartjs/utils/make-reward-chart'
import TrafficLightManager from '@/map2/map-traffic-lights'
const makeDonutDefaultDataset = () => ({
  datasets: [{
    data: [1, 1, 1],
    backgroundColor: ['red', 'orange', 'green']
  }],
  labels: ['막힘', '정체', '원활']
})

const { log } = console

function setupEventHandler () {
  this.$on('salt:data', (d) => {
    this.avgSpeed = d.roads.map(road => road.speed).reduce((acc, cur) => {
      acc += cur
      return acc
    }, 0) / d.roads.length

    this.avgSpeedView = {
      datasets: [{
        data: bins(d.roads).map(R.prop('length')),
        backgroundColor: config.colorsOfSpeed2
      }],
      labels: config.speeds
    }
  })

  this.$on('salt:status', async (status) => {
    this.progress = status.progress
    if (status.status === 1 && status.progress === 100) {
      // FINISHED
    }
  })

  this.$on('salt:finished', async () => {
    log('**** SIMULATION FINISHED *****')
  })

  this.$on('optimization:epoch', (e) => {
    log('*** OPTIMIZATION EPOCH ***')
    this.rewards = makeRewardChartData(e.data)
  })

  this.$on('optimization:finished', (e) => {
    log('*** OPTIMIZATION FINISHED ***')
    // setTimeout(() => this.$swal('신호 최적화 완료'), 2000)
  })

  this.$on('map:moved', ({ zoom, extent }) => {
    this.currentZoom = zoom
    this.currentExtent = [extent.min, extent.max]
  })

  this.$on('ws:open', () => {
    this.wsStatus = 'open'
  })

  this.$on('ws:error', (error) => {
    this.wsStatus = 'error'
    this.makeToast(error.message, 'warning')
  })

  this.$on('ws:close', () => {
    this.wsStatus = 'close'
    this.makeToast('ws connection closed', 'warning')
  })
}

export default {
  name: 'OptimizationResultMap',
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
    UniqCardTitle
  },
  computed: {
    progressOfEpoch () {
      if (this.rewards.labels.length === 0) return 0
      return ((this.rewards.labels.length) / +this.simulation.configuration.epoch) * 100
    }
  },
  data () {
    return {
      simulationId: null,
      simulation: { configuration: {} },
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      mapHeight: 1024, // map view height
      mapManager: null,
      showLoading: false,
      congestionColor,
      currentEdge: null,
      wsClient: null,
      currentZoom: '',
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0.00,
      progress: 0,
      avgSpeedView: makeDonutDefaultDataset(),
      defaultOption: lineChartOption,
      rewards: { labels: [] },
      apiErrorMessage: '',
      trafficLightManager: null
    }
  },
  destroyed () {
    if (this.map) {
      this.map.remove()
    }
    if (this.wsClient) {
      this.wsClient.close()
    }
    window.removeEventListener('resize', this.getWindowHeight)
  },
  async mounted () {
    this.simulationId = this.$route.params ? this.$route.params.id : null

    const { simulation } = await simulationService.getSimulationInfo(this.simulationId)
    this.simulation = simulation
    this.showLoading = true
    this.resize()
    this.map = makeMap({ mapId: this.mapId, zoom: 16 })
    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this
    })
    this.mapManager.loadMapData()

    this.trafficLightManager = TrafficLightManager(this.map, null, this)
    await this.trafficLightManager.load()

    this.wsClient = WebSocketClient({
      simulationId: this.simulationId,
      eventBus: this
    })
    this.wsClient.init()
    this.showLoading = false

    this.rewards = makeRewardChartData([[1, 2, 3, 4], [10, 20, 5, 10]])
    setupEventHandler.bind(this)()

    window.addEventListener('resize', this.resize)
  },
  methods: {
    chartClicked (value) {
      console.log('chart clicked', value)
    },
    resize () {
      // this.mapHeight = window.innerHeight - 220 // update map height to current height
      this.mapHeight = window.innerHeight - 50
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
    // 신호 최적화 요청
    async runTrain () {
      const junctionIds = this.simulation.configuration.junctionId.split(',')
      const sleep = () => new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 3000)
      })
      for (let i = 0; i < junctionIds.length; i++) {
        this.trafficLightManager.setOptJunction(junctionIds[i])
        await sleep()
      }

      this.trafficLightManager.clearOptJunction()

      try {
        const result = await optimizationService.runTrain(this.simulationId)
        console.log(result)
      } catch (err) {
        console.log(err.message)
        this.apiErrorMessage = err.message
      }
    }
  }
}
