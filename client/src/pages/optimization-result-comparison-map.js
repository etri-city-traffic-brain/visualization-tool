/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */

import Vue from 'vue'

import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'

import WebSocketClient from '@/realtime/ws-client'

import simulationService from '@/service/simulation-service'

import SimulationResult from '@/pages/SimulationResult.vue'

// import HistogramChart from '@/components/charts/HistogramChart'
// import Doughnut from '@/components/charts/Doughnut'

import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'
import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import UniqMapChanger from '@/components/UniqMapChanger'

import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'

import UniqCardTitle from '@/components/func/UniqCardTitle'
import { optimizationService } from '@/service'

import signalService from '@/service/signal-service'

import toastMixin from '@/components/mixins/toast-mixin'
import lineChartOption from '@/charts/chartjs/line-chart-option'
import barChartOption from '@/charts/chartjs/bar-chart-option'
import style from '@/components/style'

import TrafficLightManager from '@/map2/map-traffic-lights'

import drawChart from '@/optsig/chart-reward-phase'

const sa1 = {
  cluster_563100866_563103911_563103912: [
    '-563100999',
    '563100999',
    '-563100969',
    '563104779',
    '-563104778',
    '563104777'
  ],
  cluster_563103599_563103904_563103905_563103906: [
    '-563104764',
    '563104764',
    '563104841',
    '563113235',
    '-563104347',
    '563104347',
    '563104767',
    '563104779'
  ],
  cluster_563103430_563103601_563103853_563103854_563103855_563103884_563103885_563103893_563103946_563103947_563107941_563107942: [
    '-563109423',
    '-563104726',
    '-563105638',
    '-563111309',
    '563104785',
    '563104839',
    '563104841',
    '563109425'
  ],
  cluster_563103437_563103890_563103913_563103914: [
    '563104785',
    '563104839',
    '563104782',
    '563104676',
    '-563104734',
    '563104734',
    '-563104366',
    '563104366'
  ],
  cluster_563103641_563103889_563103894_563103895: [
    '-563104834',
    '563104834',
    '563104782',
    '563104746',
    '-563104674',
    '563104674',
    '563104678',
    '563104750'
  ],
  cluster_563103888_563103891: [
    '-563104735',
    '563104731',
    '563104736',
    '563104746'
  ],
  cluster_563102154_563103845_563109514_563109515: [
    '-563102351',
    '563102351',
    '-563104654',
    '563104654',
    '563114217',
    '-563104663',
    '563104666',
    '-563114214'
  ],
  cluster_563100016_563103847_563109512_563109513: [
    '-563103481',
    '-563104660',
    '-563113678',
    '-563114212',
    '563100021',
    '563103481',
    '563113678',
    '563114211'
  ],
  cluster_563103433_563103849_563103871_563103872_563103873_563103874_563103875_563104618: [
    '-563104706',
    '563104700',
    '-563104154',
    '563104154',
    '-563104704',
    '-563111247',
    '563104704',
    '563105674'
  ],
  cluster_563109510_563109511: [
    '-563114206',
    '-563114208',
    '563114207',
    '563114209'
  ]
}

const xx = Object.values(sa1).reduce((acc, cur) => {
  acc.push(cur[0])
  return acc
}, [])

const calcAvg = (values = []) => {
  const sum = values.reduce((acc, cur) => {
    acc += cur || 0
    return acc
  }, 0)
  return (sum / values.length).toFixed(2)
}

function getAvgSpeeds (data) {
  const values = Object.values(data)
  const avg = new Array(values[0].length).fill(0)
  const len = values[0].length
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < len; j++) {
      avg[j] += Number(values[i][j].avgSpeed)
    }
  }
  const rr = avg.map(a => a / values.length)
  return rr
}

const dataset = (label, color, data) => ({
  label,
  fill: false,
  borderColor: color,
  backgroundColor: color,
  borderWidth: 1,
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
  let avgD1 = data1.reduce((acc, cur) => (acc += ~~cur), 0) / data1.length
  let avgD2 = data2.reduce((acc, cur) => (acc += ~~cur), 0) / data2.length

  avgD1 = avgD1.toFixed(2)
  avgD2 = avgD2.toFixed(2)

  return {
    labels: new Array(data2.length).fill(0).map((_, i) => i),
    datasets: [
      dataset(
        '기존신호',
        'grey',
        data1.map(v => v.toFixed(2))
      ),
      dataset(
        '최적신호',
        'orange',
        data2.map(v => v.toFixed(2))
      ),
      dataset('기존신호(평균)', 'green', new Array(data2.length).fill(avgD1)),
      dataset('최적신호(평균)', 'skyblue', new Array(data2.length).fill(avgD2))
    ],
    avg1: avgD1,
    avg2: avgD2
  }
}

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

const calcAvgSpeed = roads =>
  roads.map(road => road.speed).reduce((acc, cur) => (acc += cur), 0) /
  roads.length

const initSimulationData = async (
  mapId,
  slave,
  eventTarget,
  mapBus,
  wsBus,
  jIds,
  slaves
) => {
  const map = makeMap({ mapId: mapId, zoom: 17 })

  const mapManager = MapManager({
    map: map,
    simulationId: slave,
    eventBus: mapBus
  })

  const wsClient = WebSocketClient({
    simulationId: slave,
    eventBus: wsBus

    // eventBus: mapBus
  })
  const trafficLightManager = TrafficLightManager(map, null, eventTarget)
  await trafficLightManager.load()
  trafficLightManager.setTargetJunctions(jIds)

  mapManager.loadMapData()
  wsClient.init(slaves)
  return {
    map,
    mapManager,
    wsClient,
    bus: mapBus,
    trafficLightManager,
    slave
  }
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
      mapHeight: 600, // map view height
      sidebar: false,
      currentStep: 1,
      // slideMax: 0,
      congestionColor,
      currentEdge: null,
      playBtnToggle: false,
      player: null,
      chart1: {
        avgSpeedsInView: [],
        avgSpeedsJunctions: [],
        avgSpeedInView: 0,
        avgSpeedJunction: 0,
        avgSpeed: 0,
        progress: 0,
        speedsPerJunction: {}
      },
      chart2: {
        avgSpeedsInView: [],
        avgSpeedsJunctions: [],
        avgSpeedInView: 0,
        avgSpeedJunction: 0,
        avgSpeed: 0,
        progress: 0,
        speedsPerJunction: {},
        efficiency1: 0,
        efficiency2: 0
      },
      chart: {
        avgChartInView: {}, // realtime chart
        avgChartJunctions: {},
        junctionSpeeds: {}
      },

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
      showWaitingMsg: false,
      avgSpeedJunction: 0,
      statusMessage: [],
      timer: null
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

    if (this.timer) {
      clearInterval(this.timer)
    }

    window.removeEventListener('resize', this.getWindowHeight)
  },
  computed: {
    config () {
      if (this.simulation) {
        return this.simulation.configuration
      } else {
        return {}
      }
    },
    improvementRate () {
      const v1 = this.chart1.avgSpeed
      const v2 = this.chart2.avgSpeed
      return 100 * ((v2 - v1) / ((v2 + v1) / 2))
    },
    speedsPerJunction () {
      const keys = Object.keys(this.chart2.speedsPerJunction)
      const r = {}
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const values = this.chart1.speedsPerJunction[key] || []
        const values2 = this.chart2.speedsPerJunction[key] || []
        const spd1 = calcAvg(values.map(v => Number(v.avgSpeed)))
        const spd2 = calcAvg(values2.map(v => Number(v.avgSpeed)))
        r[key] = [spd1, spd2]
      }
      return r
    }
  },
  async mounted () {
    const optId = this.$route.params ? this.$route.params.id : null

    const { simulation } = await simulationService.getSimulationInfo(optId)

    if (!simulation) {
      return
    }
    this.status = simulation.status
    this.simulation = simulation
    this.fixedSlave = simulation.slaves[1]
    this.testSlave = simulation.slaves[0]

    this.resize()

    const simEventBusFixed = new Vue({})
    const simEventBusTest = new Vue({})
    const buffer = []
    const wsBus = new Vue({})
    this.simulations = [
      await initSimulationData(
        this.mapIds[0],
        this.fixedSlave,
        this,
        simEventBusFixed,
        // simEventBusFixed,
        wsBus,
        this.simulation.configuration.junctionId.split(','),
        [this.fixedSlave, this.testSlave]
      ),
      await initSimulationData(
        this.mapIds[1],
        this.testSlave,
        this,
        simEventBusTest,
        simEventBusTest,
        this.simulation.configuration.junctionId.split(','),
        [this.fixedSlave, this.testSlave]
      )
    ]

    this.initMapEventHandler()

    const busFixed = simEventBusFixed
    const busTest = simEventBusTest

    wsBus.$on('salt:data', data => {
      buffer.push(data)
    })
    wsBus.$on('salt:status', async () => {})
    wsBus.$on('salt:finished', async () => {})

    busFixed.$on('salt:data', dataSim => {
      buffer.push(dataSim)
    })

    // 최적화 시뮬레이션이 수행 속도가 느림
    // 버퍼로부터 데이터 가져와 이벤트 발생
    busTest.$on('salt:data', () => {
      const dataSim = buffer.splice(0, 1)[0]
      if (dataSim) {
        simEventBusFixed.$emit('salt:data', dataSim)
      }
    })

    busTest.$on('salt:status', async status => {
      this.chart2.progress = status.progress
      this.chart1.progress = status.progress
      this.showWaitingMsg = false
      simEventBusFixed.$emit('salt:status', {
        ...status
      })
      if (this.chart1.progress !== 100 && status.status === 1) {
        this.chart2.progress = 100
        this.chart1.progress = 100
        this.checkStatus()
      }
      if (this.chart1.progress >= 99) {
        this.chart2.progress = 100
        this.chart1.progress = 100
      }
    })

    busTest.$on('salt:finished', async () => {
      this.chart1.progress = 100
      this.chart1.progress = 100
      if (this.chart1.progress >= 100 && this.chart1.progress >= 100) {
        this.status = 'finished'
      }
    })

    busFixed.$on('ws:error', error => {
      this.makeToast(error.message, 'warning')
    })

    busFixed.$on('ws:close', () => {})

    this.$on('signalGroup:clicked', () => {})

    this.$on('junction:clicked', async p => {
      const crossName = signalService.nodeIdToName(p.nodeId)
      this.selectedNode = crossName

      const rl = this.chart2.speedsPerJunction[crossName]

      if (!rl) {
        return
      }
      this.phaseRewardChartRl.setOption(drawChart.makeOption(rl))
      const ft = this.chart1.speedsPerJunction[crossName]
      if (!ft) {
        return
      }
      this.phaseRewardChartFt.setOption(
        drawChart.makeOption(ft.slice(0, rl.length))
      )
    })

    const updateReward = () => {
      optimizationService
        .getPhaseReward(this.simulation.id, 'rl')
        .then(res => res.data)
        .then(dataRl => {
          this.chart2.speedsPerJunction = dataRl

          optimizationService
            .getPhaseReward(this.simulation.id, 'ft')
            .then(res => res.data)
            .then(dataFt => {
              this.chart1.speedsPerJunction = dataFt

              const r1 = getAvgSpeeds(dataRl)
              const r2 = getAvgSpeeds(dataFt)

              const a = calcAvg(r1)
              const b = calcAvg(r2)
              this.chart2.efficiency2 = this.calcEfficency(b, a)
              this.chart.avgChartInView = makeLineData(r2, r1)
              console.log(r1.length, r2.length)
              // this.chart1.avgSpeedJunction = r1[r1.length - 1].toFixed(2)
              // this.chart2.avgSpeedJunction = r2[r2.length - 1].toFixed(2)
              this.chart1.avgSpeedJunction = this.chart.avgChartInView.avg2
              this.chart2.avgSpeedJunction = this.chart.avgChartInView.avg1
            })
        })
        .catch(err => {
          console.log(err.message)
        })
    }

    this.timer = setInterval(() => {
      if (this.chart1.progress >= 99) {
        // || this.chart1.progress < 1)
        setTimeout(() => {
          updateReward()
          // clearInterval(this.timer)
        }, 3000)
        return
      }
      updateReward()
    }, 3000)

    window.addEventListener('resize', this.resize)

    const result = await optimizationService.getRewardTotal(this.simulation.id)

    const results = Object.values(result.data)

    const total = results[0]
    const label = new Array(total.length).fill(0).map((v, i) => i)
    const reward = total.map(v => Number(v.reward).toFixed(2))
    const avg = total.map(v => Number(v.rewardAvg).toFixed(2))

    this.rewards = makeRewardChart('total', label, reward, avg)

    this.phaseRewardChartFt = drawChart(this.$refs['phase-reward-ft'], [])
    this.phaseRewardChartRl = drawChart(this.$refs['phase-reward-rl'], [])

    // this.speedChart1 = drawChart2(this.$refs['chart-avg-speed-junction'], 20)
    // a chart on zoom -> dispatch an action
    this.phaseRewardChartFt.on('datazoom', params => {
      const { start, end, batch } = params

      if (batch) {
        this.phaseRewardChartRl.dispatchAction({
          type: 'dataZoom',
          start: start,
          end: end,
          batch: [
            {
              startValue: batch[0].startValue,
              endValue: batch[0].endValue,
              start: batch[0].start,
              end: batch[0].end
            }
          ]
        })
      } else {
        this.phaseRewardChartRl.dispatchAction({
          type: 'dataZoom',
          start: start,
          end: end
        })
      }
      // // zoom the others!
    })

    this.phaseRewardChartRl.on('datazoom', function (params) {})
  },
  methods: {
    calcEfficency (v1, v2) {
      v1 = Number(v1)
      v2 = Number(v2)
      return ((100 * (v2 - v1)) / ((v2 + v1) / 2)).toFixed(2)
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
      this.chart1.avgSpeedsInView = []
      this.chart2.avgSpeedsInView = []
      this.chart1.avgSpeedsJunctions = []
      this.chart2.avgSpeedsJunctions = []

      try {
        await simulationService.stopSimulation(this.simulation.id)
        await optimizationService.runTest(
          this.simulation.id,
          this.testSlave,
          this.selectedEpoch
        )
      } catch (err) {
        log(err.message)
        this.status = 'error'
      }
      this.status = 'running'
    },
    addMessage (msg) {
      this.statusMessage.push(msg)
      if (this.statusMessage.length > 100) {
        this.statusMessage.shift()
      }
    },
    async stopTest () {
      this.status = 'stopping'
      this.addMessage('stop ' + this.simulation.id)
      await optimizationService
        .stop(this.simulation.id, 'slave')
        .then(r => r.data)
        .then(data => {
          this.addMessage(data.msg)
        })
      this.checkStatus()
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
              duration: 0
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
      simulationService.getSimulationInfo(this.simulation.id).then(data => {
        this.status = data.simulation.status
      })
    }
  }
}
