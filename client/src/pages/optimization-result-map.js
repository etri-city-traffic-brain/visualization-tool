//    신호최적화 학습 화면

/* eslint-disable no-unused-expressions */

import * as R from 'ramda'
import * as d3 from 'd3'

import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'
import WebSocketClient from '@/realtime/ws-client'
import SimulationResult from '@/pages/SimulationResult.vue'
import bins from '@/stats/histogram'
import config from '@/stats/config'

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
import barChartOption from '@/charts/chartjs/bar-chart-option'
import makeRewardChartData from '@/charts/chartjs/utils/make-reward-chart'
import TrafficLightManager from '@/map2/map-traffic-lights'
import signalGroups from '@/config/junction-config'

import { optimizationService, simulationService } from '@/service'

const rewardChartOption = {
  maintainAspectRatio: false,
  animation: false,
  spanGaps: true,
  responsive: true,
  showLine: true,
  title: {
    display: false
  },
  interaction: {
    mode: 'index'
  },
  tooltips: {
    mode: 'index',
    intersect: false,
    enabled: true
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
          autoSkipPadding: 15,
          maxRotation: 0,
          display: true,
          fontColor: 'white'
        }
      }
    ]
  },
  legend: {
    display: false,
    labels: {
      fontColor: 'white',
      fontSize: 12
    }
  },
}

const colorScaleImproment = d3.scaleLinear()
  .domain([-10, 0, 10, 20, 30])
  .range(['white', 'white', 'orange', 'yellow', 'green'])

function makeDonutDefaultDataset() {
  return {
    datasets: [
      {
        data: [1, 1, 1],
        backgroundColor: ['red', 'orange', 'green']
      }
    ],
    labels: ['막힘', '정체', '원활']
  }
}

function makeRewardChart(label, labels = [], data = [], data2 = []) {
  return {
    labels,
    label,
    datasets: [
      {
        label: 'reward',
        backgroundColor: 'skyblue',
        borderColor: 'skyblue',
        data,
        fill: false,
        borderWidth: 2,
        pointRadius: 2
      },
      {
        label: 'reward(40avg)',
        backgroundColor: 'orange',
        borderColor: 'orange',
        data: data2,
        fill: false,
        borderWidth: 2,
        pointRadius: 2
      }
    ]
  }
}

function setupEventHandler() {
  this.$on('salt:data', d => {
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
    this.progress = status.progress
    if (status.progress >= 99) {
      this.progress = 100
      setTimeout(() => {
        try {
          this.getReward().then(() => { })
        } catch (err) {
          log(err.message)
        }
      }, 5000)
    }

    if (status.status === 1 && status.progress === 100) {
      // FINISHED
    }
  })

  this.$on('optimization:finished', () => {
    this.$bvToast.toast('OPTIMIZATION FINISHED', {
      title: 'OPTIMIZATION FINISHED',
      variant: 'info',
      autoHideDelay: 3000,
      appendToast: true,
      toaster: 'b-toaster-top-right'
    })
    setTimeout(async () => {
      await this.getReward()
    }, 3000)
  })

  this.$on('map:moved', ({ extent }) => {
    this.currentExtent = [extent.min, extent.max]
  })

  this.$on('ws:open', () => {
    this.wsStatus = 'open'
  })

  this.$on('ws:error', error => {
    this.wsStatus = 'error'
    this.makeToast(error.message, 'warning')
  })

  this.$on('ws:close', () => {
    this.wsStatus = 'close'
  })

  this.$on('junction:selected', () => {
    log('junction:selected')
  })
}

const { log } = console

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
    status() {
      return this.simulation.status
    }
  },
  data() {
    return {
      simulationId: null,
      simulation: { configuration: {} },
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      mapHeight: 1024, // map view height
      mapManager: null,
      showLoading: false,
      congestionColor,
      wsClient: null,
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0.0,
      progress: 0,
      progressOpt: 0,
      avgSpeedView: makeDonutDefaultDataset(),
      defaultOption: lineChartOption,
      rewardChartOption,
      barChartOption,
      rewards: { labels: [] },
      trafficLightManager: null,
      rewardCharts: [],
      rewardTotal: {},
      epochs: 0,
      isReady: false,
      optTrainResult: []
    }
  },
  destroyed() {
    if (this.map) {
      this.map.remove()
    }
    if (this.wsClient) {
      this.wsClient.close()
    }
    window.removeEventListener('resize', this.getWindowHeight)
  },

  async mounted() {
    this.simulationId = this.$route.params ? this.$route.params.id : null

    this.showLoading = true
    this.resize()
    this.map = makeMap({ mapId: this.mapId, zoom: 15 })
    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this
    })

    const center = this.simulation.configuration.center
    if (center) {
      this.map.animateTo({
        center: [center.x, center.y]
      })
    }

    this.mapManager.loadMapData()

    await this.updateStatus()

    this.trafficLightManager = TrafficLightManager(this.map, this.getGroupIds(), this)
    // this.trafficLightManager.setTargetJunctions(this.simulation.configuration.junctionId.split(','))
    this.trafficLightManager.setOptJunction(this.simulation.configuration.junctionId.split(','))

    this.wsClient = WebSocketClient({
      simulationId: this.simulationId,
      eventBus: this
    })
    this.wsClient.init()
    this.showLoading = false

    this.rewards = makeRewardChartData([
      [1, 2, 3, 4],
      [10, 20, 5, 10]
    ])
    setupEventHandler.bind(this)()

    window.addEventListener('resize', this.resize)

    if (this.simulation.status === 'running') {
      this.showProgressing()
    }

    await this.trafficLightManager.load()

    await this.getReward()

    const result = await optimizationService.getOptTrainResult(this.simulationId, 0)
    this.optTrainResult = result
    this.trafficLightManager.setOptTrainResult(result)
  },
  methods: {
    getColorForImprovedRate(v) {
      return colorScaleImproment(v)
    },
    getRegionName(v) {
      const m = {
        doan: '도안',
        cdd3: '연구단지'
      }
      return m[v] || ''
    },
    stopVis() {
      this.wsClient.kill()
    },
    startVis() {
      this.wsClient.restart()
    },
    getGroupIds() {
      const junctionIds = this.simulation.configuration.junctionId.split(',')
      if (junctionIds[0].indexOf('SA') >= 0) {
        let jids = []
        junctionIds.forEach(jId => {
          signalGroups.forEach(s => {
            if (s.properties.groupId === jId) {
              jids = jids.concat(s.properties.junctions)
            }
          })
        })
      }
      return junctionIds
    },
    showProgressing() {
      const junctionIds = this.simulation.configuration.junctionId.split(',')
      if (junctionIds[0].indexOf('SA') >= 0) {
        let jids = []
        junctionIds.forEach(jId => {
          signalGroups.forEach(s => {
            if (s.properties.groupId === jId) {
              jids = jids.concat(s.properties.junctions)
            }
          })
        })
        this.trafficLightManager.setOptJunction(jids)
      } else {
        this.trafficLightManager.setOptJunction(junctionIds)
      }
    },
    async chartClicked(value) {
      try {
        const result = await optimizationService.getOptTrainResult(this.simulationId, value)
        this.optTrainResult = result
        this.trafficLightManager.setOptTrainResult(result)

      } catch (err) {
        log(err.message)
      }
    },
    resize() {
      // this.mapHeight = window.innerHeight - 220 // update map height to current height
      this.mapHeight = window.innerHeight - 50
    },
    makeToast(msg, variant = 'info') {
      this.$bvToast.toast(msg, {
        title: 'Notification',
        autoHideDelay: 5000,
        appendToast: false,
        variant,
        toaster: 'b-toaster-bottom-right'
      })
    },
    async connectWebSocket() {
      this.wsClient.init()
    },
    async selectEpoch(v) {
      this.chartClicked(v)
    },
    async updateStatus() {
      try {
        const { simulation } = await simulationService.getSimulationInfo(this.simulationId)

        this.simulation = simulation

        if (simulation.status !== 'running') {
          if (this.trafficLightManager) {
            this.trafficLightManager.setOptJunction([])
          }
        }
      } catch (e) {
        log(e.message)
      }
    },
    async getReward() {
      try {
        const result = await optimizationService.getReward(this.simulationId)

        this.rewardCharts = []
        Object.keys(result.data).forEach(key => {
          const value = result.data[key]
          const label = new Array(value.length).fill(0).map((v, i) => i)
          const reward = value.map(v => Number(v.reward).toFixed(2))
          const rewardAvg = value.map(v => Number(v.rewardAvg).toFixed(2))

          this.rewardCharts.push(makeRewardChart(key, label, reward, rewardAvg))
        })
      } catch (err) {
        log(err.message)
      }
      this.getRewardTotal()
      this.updateStatus()

    },
    async getRewardTotal() {
      try {
        const result = await optimizationService.getRewardTotal(this.simulationId).then(res => res.data)
        const results = Object.values(result)
        if (results.length > 0) {
          const total = results[0]

          const label = new Array(total.length).fill(0).map((v, i) => i)
          const reward = total.map(v => Number(v.reward).toFixed(2))
          const avg = total.map(v => Number(v.rewardAvg).toFixed(2))
          this.epochs = label
          this.rewardTotal = makeRewardChart('total', label, reward, avg)
          this.progressOpt = total.length
        }

        if (this.progressOpt + '' === this.simulation.configuration.epoch) {
          this.trafficLightManager.clearOptJunction()
        }
      } catch (err) {
        log(err)
      }
    },
    async runTrain() {
      const { value: yes } = await this.$swal({
        title: '신호최적화 학습을 시작합니다.',
        text: this.simulation.id,
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '시작',
        cancelButtonText: '취소'
      })

      if (!yes) {
        return
      }

      try {
        this.simulation.status = 'running'
        await optimizationService.runTrain(this.simulationId)
        this.showProgressing()
        await this.updateStatus()
      } catch (err) {
        log(err.message)
        this.$bvToast.toast('신호학습을 중지하고 다시 시도하세요.', {
          title: '신호학습 실패',
          variant: 'danger',
          autoHideDelay: 3000,
          appendToast: true,
          toaster: 'b-toaster-top-right'
        })
      }
    },
    async stop() {
      this.simulation.status = 'stopping'
      try {
        await optimizationService.stop(this.simulationId)
        await this.updateStatus()
      } catch (err) {
        log('fail to stop', err.message)
      }
    },
  }
}
