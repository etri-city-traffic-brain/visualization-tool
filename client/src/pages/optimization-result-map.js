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
import signalGroups from '@/config/junction-config'
import axios from 'axios'

const makeDonutDefaultDataset = () => ({
  datasets: [
    {
      data: [1, 1, 1],
      backgroundColor: ['red', 'orange', 'green']
    }
  ],
  labels: ['막힘', '정체', '원활']
})

const makeRewardChart = (label, labels = [], data = [], data2 = []) => {
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
        borderWidth: 1,
        pointRadius: 1
      },
      {
        label: '40avg',
        backgroundColor: 'red',
        borderColor: 'red',
        data: data2,
        fill: false,
        borderWidth: 1,
        pointRadius: 1
      }
    ]
  }
}

const { log } = console

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
    console.log(status.progress)
    if (status.progress >= 99) {
      this.progress = 100
      setTimeout(() => {
        try {
          this.getReward().then(() => console.log('state updated'))
          console.log('update state')
        } catch (err) { }
      }, 5000)
    }

    if (status.status === 1 && status.progress === 100) {
      // FINISHED
    }
  })

  this.$on('optimization:progress', async e => {
    console.log('opt:progress', e.progress)
    this.progressOpt = e.progress
    if (e.progress >= 99) {
      this.progressOpt = 100
    }
    log('optimization:progress', e.progress)
    try {
      await this.getReward()
    } catch (err) { }
  })

  this.$on('salt:finished', async () => {
    log('**** SIMULATION FINISHED *****')
    this.$bvToast.toast('Simulation Finished', {
      title: 'xxxx',
      variant: 'info',
      autoHideDelay: 3000,
      appendToast: true,
      toaster: 'b-toaster-top-right'
    })
  })

  this.$on('optimization:epoch', e => {
    // log('*** OPTIMIZATION EPOCH ***')
    // this.rewards = makeRewardChartData(e.data)

    this.$bvToast.toast('OPTIMIZATION EPOCH', {
      title: 'OPTIMIZATION EPOCH',
      variant: 'info',
      autoHideDelay: 3000,
      appendToast: true,
      toaster: 'b-toaster-top-right'
    })
  })

  this.$on('optimization:finished', e => {
    // log('*** OPTIMIZATION FINISHED ***')
    // setTimeout(() => this.$swal('신호 최적화 완료'), 2000)
    this.$bvToast.toast('OPTIMIZATION FINISHED', {
      title: 'OPTIMIZATION FINISHED',
      variant: 'info',
      autoHideDelay: 3000,
      appendToast: true,
      toaster: 'b-toaster-top-right'
    })
    setTimeout(async () => {
      log('** check status **')
      // await this.updateStatus()
      await this.getReward()
    }, 3000)
  })

  this.$on('map:moved', ({ zoom, extent }) => {
    this.currentZoom = zoom
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
    // this.makeToast('ws connection closed', 'warning')
  })

  this.$on('junction:selected', () => {
    log('junction:selected')
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
    progressOfEpoch() {
      if (this.rewards.labels.length === 0) return 0
      return (
        (this.rewards.labels.length / +this.simulation.configuration.epoch) *
        100
      )
    },
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
      currentEdge: null,
      wsClient: null,
      currentZoom: '',
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0.0,
      progress: 0,
      progressOpt: 0,
      avgSpeedView: makeDonutDefaultDataset(),
      defaultOption: lineChartOption,
      rewards: { labels: [] },
      apiErrorMessage: '',
      trafficLightManager: null,
      rewardCharts: [],
      rewardTotal: {}
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
    // const { simulation } = await simulationService.getSimulationInfo(this.simulationId)
    // this.simulation = simulation
    await this.updateStatus()
    this.showLoading = true
    this.resize()
    this.map = makeMap({ mapId: this.mapId, zoom: 15 })
    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this
    })
    const v = this.simulation.configuration.region
    console.log(v, this.simulation.configuration.region)
    if (v === 'doan') {
      this.map.animateTo({
        center: [127.3396677, 36.3423342]
        // zoom: 14
      })
    } else if (v === 'cdd3') {
      setTimeout(() => {
        this.map.animateTo({
          center: [127.35375270822743, 36.383148078460906]
          // zoom: 14
        })
      }, 1000)
    }

    this.mapManager.loadMapData()

    this.trafficLightManager = TrafficLightManager(this.map, null, this)
    this.trafficLightManager.setTargetJunctions(this.simulation.configuration.junctionId.split(','))
    this.trafficLightManager.setOptJunction(this.simulation.configuration.junctionId.split(','))

    await this.trafficLightManager.load()

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

    await this.getReward()

  },
  methods: {
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
    chartClicked(value) {
      log('chart clicked value:', value)
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
    async runTrain() {
      try {
        this.simulation.status = 'running'
        await optimizationService.runTrain(this.simulationId)
        this.showProgressing()
        await this.updateStatus()
      } catch (err) {
        log(err.message)
        this.apiErrorMessage = err.message
        this.$bvToast.toast('신호학습을 중지하고 다시 시도하세요.', {
          title: '신호학습 실패',
          variant: 'danger',
          autoHideDelay: 3000,
          appendToast: true,
          toaster: 'b-toaster-top-right'
        })
      }
    },
    async getReward() {
      const result = await optimizationService.getReward(this.simulationId)
      this.rewardCharts = []
      Object.keys(result.data).forEach(key => {
        const value = result.data[key]
        const label = new Array(value.length).fill(0).map((v, i) => i)
        // const reward = value.map(v => Math.floor(v.reward))
        // const avg = value.map(v => Math.floor(v.rewardAvg))

        const reward = value.map(v => Number(v.reward).toFixed(2))
        const avg = value.map(v => Number(v.rewardAvg).toFixed(2))

        this.rewardCharts.push(makeRewardChart(key, label, reward, avg))
      })

      await this.getRewardTotal()
      await this.updateStatus()
    },
    async stop() {
      this.simulation.status = 'stopping'
      try {
        await optimizationService.stop(this.simulationId)
        await this.updateStatus()
      } catch (err) {
        log('fail to stop', err.message)
      }
      // const { simulation } = await simulationService.getSimulationInfo(this.simulationId)
      // this.simulation = simulation
      // this.trafficLightManager.setOptJunction([])
    },
    async getRewardTotal() {
      try {
        const result = await optimizationService.getRewardTotal(
          this.simulationId
        )
        const results = Object.values(result.data)
        if (results.length > 0) {
          const total = results[0]

          const label = new Array(total.length).fill(0).map((v, i) => i + 1)
          const reward = total.map(v => Number(v.reward).toFixed(2))
          const avg = total.map(v => Number(v.rewardAvg).toFixed(2))

          this.rewardTotal = makeRewardChart('total', label, reward, avg)
          this.progressOpt = total.length
        }

        if (this.progressOpt + '' === this.simulation.configuration.epoch) {
          this.trafficLightManager.clearOptJunction()
        }
      } catch (err) {
        log(err)
        this.$bvToast.toast('Fail to load reward total', {
          title: 'Error',
          variant: 'danger',
          autoHideDelay: 3000,
          appendToast: true,
          toaster: 'b-toaster-top-right'
        })
      }
    }
  }
}
