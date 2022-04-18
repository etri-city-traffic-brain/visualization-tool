/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */

import Vue from 'vue'

import stepperMixin from '@/stepper/mixin'
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

import UniqCardTitle from '@/components/func/UniqCardTitle'
import makePhaseChart from '@/charts/chartjs/utils/make-phase-chart'
import { optimizationService } from '@/service'

import signalService from '@/service/signal-service'

import toastMixin from '@/components/mixins/toast-mixin'
import lineChartOption from '@/charts/chartjs/line-chart-option'
import barChartOption from '@/charts/chartjs/bar-chart-option'
import style from '@/components/style'

import TrafficLightManager from '@/map2/map-traffic-lights'

import drawChart from '@/optsig/chart-reward-phase'

const dataset = (label, color, data) => ({
  label,
  fill: false,
  borderColor: color,
  backgroundColor: color,
  borderWidth: 2,
  pointRadius: 1,
  data
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

const makeLineData = (data1 = [], data2 = []) => {
  return {
    labels: new Array(data2.length).fill(0).map((_, i) => i),
    datasets: [
      dataset('기존신호', 'grey', data1),
      dataset('최적화신호', 'orange', data2)
    ]
  }
}

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

const calcAvgSpeed = roads =>
  roads.map(road => road.speed).reduce((acc, cur) => (acc += cur), 0) /
  roads.length

const initSimulationData = async (mapId, slave, eventTarget) => {
  const map = makeMap({ mapId: mapId, zoom: 15 })

  const bus = new Vue({})
  const mapManager = MapManager({
    map: map,
    simulationId: slave,
    eventBus: bus
  })

  const wsClient = WebSocketClient({ simulationId: slave, eventBus: bus })
  const trafficLightManager = TrafficLightManager(map, null, eventTarget)
  await trafficLightManager.load()

  mapManager.loadMapData()
  wsClient.init()
  return {
    map,
    mapManager,
    wsClient,
    bus,
    trafficLightManager,
    slave
  }
}

const aggregate = objs1 => {
  if (objs1.length < 1) {
    return []
  }
  const speeds = []
  for (let i = 0; i < objs1[0].length; i++) {
    let sum = 0
    for (let j = 0; j < objs1.length; j++) {
      sum = sum + objs1[j][i]
    }
    speeds.push(sum / objs1.length)
  }
  return speeds
}

const { log } = console

export default {
  name: 'OptimizationResultComparisonMap',
  mixins: [toastMixin],
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
  data () {
    return {
      status: '',
      simulation: { configuration: {} }, // means optimization
      mapIds: [randomId(), randomId()],
      simulations: null,
      log,
      // mapHeight: 1024, // map view height
      mapHeight: 600, // map view height
      sidebar: false,
      currentStep: 1,
      slideMax: 0,
      congestionColor,
      currentEdge: null,
      playBtnToggle: false,
      player: null,
      chart1: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
        currentSpeeds: [],
        speedsPerStep: {}
        // junctionSpeeds: []
      },
      chart2: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
        currentSpeeds: [],
        speedsPerStep: {}
      },
      chart: {
        currentSpeedChart: {}, // realtime chart
        currentSpeedInViewChart: {},
        junctionSpeeds: {}
      },
      progress1: 0,
      progress2: 0,
      bottomStyle: { ...style.bottomStyle },
      playerStyle: { ...style.playerStyle },
      chartContainerStyle: {
        borderRadius: 0,
        height: this.mapHeight + 'px',
        overflow: 'auto'
      },
      lineChartOption,
      barChartOption,
      rewards: {
        labels: []
      },
      phaseFixed: {},
      phaseTest: {},
      testSlave: null,
      fixedSlave: null,
      selectedEpoch: 0,
      showEpoch: false,
      trafficLightManager: null,
      phaseRewardChartFt: null,
      phaseRewardChartRl: null,
      selectedNode: '목원대네거리',
      // selectedNode: '미래부동산삼거리',
      showWaitingMsg: false
    }
  },
  destroyed () {
    this.simulations.forEach(({ map, wsClient }) => {
      map.remove()
      wsClient.close()
    })

    this.stepPlayer && this.stepPlayer.stop()

    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }

    window.removeEventListener('resize', this.getWindowHeight)
  },
  computed: {},
  async mounted () {
    log(`${this.$options.name} is mounted`)
    const optimizationId = this.$route.params ? this.$route.params.id : null

    const { simulation, ticks } = await simulationService.getSimulationInfo(
      optimizationId
    )

    this.status = simulation.status

    this.simulation = simulation
    this.fixedSlave = simulation.slaves[1]

    this.testSlave = simulation.slaves[0]
    this.slideMax = ticks - 1

    this.resize()

    this.simulations = [
      await initSimulationData(this.mapIds[0], this.fixedSlave, this),
      await initSimulationData(this.mapIds[1], this.testSlave, this)
    ]

    this.initMapEventHandler()

    const bus1 = this.simulations[0].bus
    const bus2 = this.simulations[1].bus

    const initSaltEventHandler = (bus, chart, target) => {
      bus.$on('salt:data', d => {
        const avgSpeed = calcAvgSpeed(d.roads)
        chart.currentSpeeds.push(avgSpeed.toFixed(2) * 1)
      })
      bus.$on('salt:status', async status => {
        target.progress1 = status.progress
        this.showWaitingMsg = false
      })
      bus.$on('salt:finished', async () => {
        this.progress1 = 100
        if (target.progress1 >= 100 && target.progress2 >= 100) {
          this.status = 'finished'
          this.makeToast('bus1-테스트가 완료 되었습니다.', 'info')
          console.log('test finished')
        }
      })
    }

    initSaltEventHandler(bus1, this.chart1, this)

    bus2.$on('salt:data', d => {
      const avgSpeed = calcAvgSpeed(d.roads)
      this.chart2.currentSpeeds.push(avgSpeed.toFixed(2) * 1)
    })

    bus2.$on('salt:status', async status => {
      this.progress2 = status.progress
      this.showWaitingMsg = false
    })

    bus2.$on('salt:finished', async () => {
      this.progress2 = 100
      if (this.progress1 >= 100 && this.progress2 >= 100) {
        this.status = 'finished'
        console.log('test finished')
        this.makeToast('bus2 테스트가 완료 되었습니다.', 'info')
      }
    })

    bus1.$on('ws:error', error => {
      this.makeToast(error.message, 'warning')
    })

    bus1.$on('ws:close', () => {
      this.makeToast('ws connection closed', 'warning')
    })

    this.$on('signalGroup:clicked', p => {
      this.makeToast(p.groupId, 'info')
    })

    this.$on('junction:clicked', async p => {
      const crossName = signalService.nodeIdToName(p.nodeId)
      this.selectedNode = crossName
      if (!this.dataFt) {
        this.dataFt = await optimizationService
          .getPhaseReward(this.simulation.id, 'ft')
          .then(res => res.data)
      }

      const ft = this.dataFt[crossName]
      if (ft) {
        this.phaseRewardChartFt.setOption(drawChart.makeOption(ft))
      } else {
        this.phaseRewardChartFt.setOption(drawChart.makeOption([]))
      }

      if (!this.dataRl) {
        this.dataRl = await optimizationService
          .getPhaseReward(this.simulation.id, 'rl')
          .then(res => res.data)
      }

      const rl = this.dataRl[crossName]
      if (rl) {
        this.phaseRewardChartRl.setOption(drawChart.makeOption(rl))
      } else {
        this.phaseRewardChartRl.setOption(drawChart.makeOption([]))
      }

      // optimizationService
      //   .getPhaseReward(this.simulation.id, 'ft')
      //   .then(res => res.data)
      //   .then(dataFt => {
      //     this.dataFt = dataFt
      //     const ft = dataFt[crossName]
      //     if (ft) {
      //       this.phaseRewardChartFt.setOption(drawChart.makeOption(ft))
      //     } else {
      //       this.phaseRewardChartFt.setOption(drawChart.makeOption([]))
      //     }
      //   })
      // optimizationService
      //   .getPhaseReward(this.simulation.id, 'rl')
      //   .then(res => res.data)
      //   .then(dataRl => {
      //     this.dataRl = dataRl
      //     const rl = dataRl[crossName]
      //     if (rl) {
      //       this.phaseRewardChartRl.setOption(drawChart.makeOption(rl))
      //     } else {
      //       this.phaseRewardChartRl.setOption(drawChart.makeOption([]))
      //     }
      //   })

      // // const dataFt = phaseRewardFt.data
      // const dataRl = phaseRewardRl.data
      // // const ft = dataFt[crossName]
      // const rl = dataRl[crossName]

      // if (rl) {
      //   // this.phaseRewardChartFt.setOption(drawChart.makeOption(ft))
      //   this.phaseRewardChartRl.setOption(drawChart.makeOption(rl))
      // } else {
      //   // this.phaseRewardChartFt.setOption(drawChart.makeOption([]))
      //   this.phaseRewardChartRl.setOption(drawChart.makeOption([]))
      // }
    })

    this.$on('junction:selected', async d => {
      this.updateJunctionSpeed(d)
      this.updatePhaseChart()
    })

    window.addEventListener('resize', this.resize)

    const result = await optimizationService.getRewardTotal(this.simulation.id)

    const results = Object.values(result.data)

    const total = results[0]
    const label = new Array(total.length).fill(0).map((v, i) => i)
    const reward = total.map(v => Math.floor(v.reward))
    const avg = total.map(v => Math.floor(v.rewardAvg))

    this.rewards = makeRewardChart('total', label, reward, avg)

    // this.rewards = makeRewardChartData([label, reward])

    // try {
    //   const c = (await optimizationService.getReward(this.fixedSlave)).data
    //   this.rewards = makeRewardChartData(c)
    // } catch (err) {
    //   log(err.message)
    //   this.makeToast(err.message, 'warning')
    // }

    // optimizationService
    //   .getPhaseReward(this.simulation.id, 'ft')
    //   .then(phaseRewardFt => {
    //     const dataFt = phaseRewardFt.data
    //     const ft = dataFt[this.selectedNode]
    //     if (ft) {
    //       this.phaseRewardChartFt = drawChart(this.$refs['phase-reward-ft'], ft)
    //     }
    //   })
    //   .catch(err => {
    //     log(err.message)
    //     this.phaseRewardChartFt = drawChart(this.$refs['phase-reward-ft'], [])
    //   })

    // optimizationService
    //   .getPhaseReward(this.simulation.id, 'rl')
    //   .then(phaseRewardRl => {
    //     const dataRl = phaseRewardRl.data
    //     const rl = dataRl[this.selectedNode]
    //     if (rl) {
    //       this.phaseRewardChartRl = drawChart(this.$refs['phase-reward-rl'], rl)
    //     }
    //   })
    //   .catch(err => {
    //     this.phaseRewardChartRl = drawChart(this.$refs['phase-reward-rl'], [])
    //     log(err.message)
    //   })

    this.phaseRewardChartFt = drawChart(this.$refs['phase-reward-ft'], [])
    this.phaseRewardChartRl = drawChart(this.$refs['phase-reward-rl'], [])
  },
  methods: {
    ...stepperMixin,
    chartClicked (value) {
      this.selectedEpoch = value
      this.showEpoch = true
      setTimeout(() => {
        this.showEpoch = false
      }, 1500)
    },

    toggleState () {
      return this.playBtnToggle ? 'M' : 'A'
    },

    updateChartRealtime () {
      if (this.status !== 'running') {
        if (this.updateTimer) {
          clearTimeout(this.updateTimer)
        }
        return
      }

      if (this.progress2 >= 100 && this.progress1 >= 100) {
        log('all simulations are finished')
        this.updatePhaseChart()
        return
      }
      this.updateTimer = setTimeout(() => {
        this.chart.currentSpeedChart = makeLineData(
          this.chart1.currentSpeeds,
          this.chart2.currentSpeeds
        )
        this.updateChartRealtime()
      }, 500)
    },
    resize () {
      this.mapHeight = window.innerHeight - 50 // update map height to current height
      if (this.phaseRewardChartFt) {
        this.phaseRewardChartFt.resize()
      }
      if (this.phaseRewardChartRl) {
        this.phaseRewardChartRl.resize()
      }
    },
    async runTest () {
      this.showWaitingMsg = true
      this.chart1.currentSpeeds = []
      this.chart2.currentSpeeds = []

      // optimizationService.runFixed(this.simulation.id, this.fixedSlave).then(v => {})
      optimizationService
        .runTest(this.simulation.id, this.testSlave, this.selectedEpoch)
        .then(v => {})
      this.progress1 = 0
      this.progress2 = 0
      this.status = 'running'
      this.updateChartRealtime()
    },
    async updatePhaseChart () {
      const phaseFixed = (
        await optimizationService.getPhase(this.fixedSlave, 'fixed')
      ).data
      const phaseTest = (await optimizationService.getPhase(this.testSlave))
        .data
      this.phaseFixed = makePhaseChart(phaseFixed, 'fixed')
      this.phaseTest = makePhaseChart(phaseTest)
    },
    updateJunctionSpeed (junction) {
      const linkIds = junction.linkIds.map(v => v.LINK_ID)
      this.chart.junctionSpeeds = makeLineData(
        ...this.simulations.map(simulation => {
          const speedsArray = Object.entries(
            simulation.mapManager.getEdgesInView()
          )
            .filter(
              entry => entry[0].includes('-') && linkIds.includes(entry[0])
            )
            .map(e => e[1])
          return aggregate(speedsArray)
        })
      )
    },
    initMapEventHandler () {
      const map1 = this.simulations[0].map
      const map2 = this.simulations[1].map

      const moveHandler = (map1, map2) => {
        const moveTo = (map, target) => {
          map.animateTo(
            {
              center: target.getCenter(),
              zoom: target.getZoom()
            },
            {
              duration: 10
            }
          )
        }

        return e => {
          if (e.target.id === map1.id) {
            moveTo(map2, e.target)
          }
        }
      }

      const map1ToMap2 = moveHandler(map1, map2)
      const map2ToMap1 = moveHandler(map2, map1)

      map1.on('moveend', map1ToMap2)
      map2.on('moveend', map2ToMap1)
      map1.on('zoomend', map1ToMap2)
      map2.on('zoomend', map2ToMap1)
    },
    async checkStatus () {
      const { simulation } = await simulationService.getSimulationInfo(
        this.simulation.id
      )
      this.status = simulation.status
    }
  }
}
