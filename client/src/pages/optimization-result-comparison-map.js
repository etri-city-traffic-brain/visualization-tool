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

import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'
import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import UniqMapChanger from '@/components/UniqMapChanger'

import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'

import UniqCardTitle from '@/components/func/UniqCardTitle'
import { optimizationService as optSvc } from '@/service'

import signalService from '@/service/signal-service'

import toastMixin from '@/components/mixins/toast-mixin'
import lineChartOption from '@/charts/chartjs/line-chart-option'
import barChartOption from '@/charts/chartjs/bar-chart-option'
import style from '@/components/style'

import TrafficLightManager from '@/map2/map-traffic-lights'
import map from '@/region-code'
import drawChart from '@/optsig/chart-reward-phase'

const calcAvg = (values = []) => {
  const sum = values.reduce((acc, cur) => {
    acc += cur || 0
    return acc
  }, 0)
  return (sum / values.length).toFixed(2)
}

function calcAvgs (data, property) {
  const values = Object.values(data)
  const avg = new Array(values[0].length).fill(0)
  const len = values[0].length
  for (let i = 0; i < values.length; i++) {
    for (let j = 0; j < len; j++) {
      avg[j] += Number(values[i][j][property])
    }
  }
  return avg.map(a => a / values.length)
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

const makeSpeedLineData = (dataFt = [], dataRl = []) => {
  let avgFt = dataFt.reduce((acc, cur) => (acc += ~~cur), 0) / dataFt.length
  let avgRl = dataRl.reduce((acc, cur) => (acc += ~~cur), 0) / dataRl.length

  avgFt = avgFt.toFixed(2)
  avgRl = avgRl.toFixed(2)

  return {
    labels: new Array(dataRl.length).fill(0).map((_, i) => i),
    datasets: [
      dataset(
        '기존신호',
        'grey',
        dataFt.map(v => v.toFixed(2))
      ),
      dataset(
        '최적신호',
        'orange',
        dataRl.map(v => v.toFixed(2))
      ),
      dataset('기존신호(평균)', 'blue', new Array(dataRl.length).fill(avgFt)),
      dataset('최적신호(평균)', 'skyblue', new Array(dataRl.length).fill(avgRl))
    ],
    avgFt: avgFt,
    avgRl: avgRl
  }
}

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

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
        travelTimeJunction: 0,
        avgSpeed: 0,
        progress: 0,
        speedsPerJunction: {},
        action: ''
      },
      chart2: {
        avgSpeedsInView: [],
        avgSpeedsJunctions: [],
        avgSpeedInView: 0,
        avgSpeedJunction: 0,
        travelTimeJunction: 0,
        avgSpeed: 0,
        progress: 0,
        speedsPerJunction: {},
        efficiency1: 0,
        effSpeed: 0,
        action: ''
      },
      chart: {
        avgSpeedChartInView: {}, // realtime chart
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
      // phaseRewardChartFt: null,
      // phaseRewardChartRl: null,
      selectedNode: '목원대네거리',
      // selectedNode: '미래부동산삼거리',
      showWaitingMsg: false,
      avgSpeedJunction: 0,
      statusMessage: [],
      timer: null,
      statusText: '',
      speedView: false
    }
  },
  destroyed () {
    this.simulations.forEach(({ map, wsClient }) => {
      map.remove()
      wsClient.close()
    })

    if (this.timer) {
      clearTimeout(this.timer)
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
      const result = {}
      for (let i = 0; i < keys.length; i++) {
        const jId = keys[i]
        const v1 = this.chart1.speedsPerJunction[jId] || []
        const v2 = this.chart2.speedsPerJunction[jId] || []
        const spd1 = calcAvg(v1.map(v => Number(v.avgSpeed)))
        const spd2 = calcAvg(v2.map(v => Number(v.avgSpeed)))
        result[jId] = [spd1, spd2]
      }
      return result
    },
    travelTimePerJunction () {
      const keys = Object.keys(this.chart2.speedsPerJunction)
      const result = {}
      for (let i = 0; i < keys.length; i++) {
        const jId = keys[i]
        const v1 = this.chart1.speedsPerJunction[jId] || []
        const v2 = this.chart2.speedsPerJunction[jId] || []
        const spd1 = calcAvg(v1.map(v => Number(v.avgTravelTime)))
        const spd2 = calcAvg(v2.map(v => Number(v.avgTravelTime)))
        result[jId] = [spd1, spd2]
      }
      return result
    },
    actionForOpt () {
      const info = this.chart2.speedsPerJunction
      const s = this.selectedNode
      const t = info[s]
      if (t) {
        console.log(t[0], t.length, t[t.length - 1])
        return [t[0], t[t.length - 1]]
      }
      return [{}, {}]
    }
  },
  async mounted () {
    window.scrollTo(0, 0)

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
        this.checkStatus()
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

      // const rl = this.chart2.speedsPerJunction[crossName]

      // if (!rl) {
      //   return
      // }
      // this.phaseRewardChartRl.setOption(drawChart.makeOption(rl))
      // const ft = this.chart1.speedsPerJunction[crossName]
      // if (!ft) {
      //   return
      // }
      // this.phaseRewardChartFt.setOption(
      //   drawChart.makeOption(ft.slice(0, rl.length))
      // )
    })

    const updateReward = async forceUpdate => {
      const start = new Date().getTime()
      const progress = this.chart1.progress
      if ((progress > 0 && progress < 100) || forceUpdate) {
        this.statusText = 'loading...'
        const dataRl = await optSvc
          .getPhaseReward(this.simulation.id, 'rl')
          .then(res => res.data)
        const dataFt = await optSvc
          .getPhaseReward(this.simulation.id, 'ft')
          .then(res => res.data)

        this.chart1.speedsPerJunction = dataFt // simulate
        this.chart2.speedsPerJunction = dataRl // optimization

        const speedsRl = calcAvgs(dataRl, 'avgSpeed')
        const speedsFt = calcAvgs(dataFt, 'avgSpeed')

        const ttsRl = calcAvgs(dataRl, 'avgTravelTime')
        const ttsFt = calcAvgs(dataFt, 'avgTravelTime')

        const avgSpeedRl = calcAvg(speedsRl)
        const avgSpeedFt = calcAvg(speedsFt)

        const ttRl = calcAvg(ttsRl)
        const ttFt = calcAvg(ttsFt)

        this.chart2.effSpeed = this.calcEfficency(avgSpeedFt, avgSpeedRl)
        this.chart2.effTravelTime = this.calcEfficency(ttRl, ttFt)
        log(ttFt, ttRl, this.calcEfficency(ttRl, ttFt))
        this.chart.avgSpeedChartInView = makeSpeedLineData(speedsFt, speedsRl)
        this.chart.travelTimeChartInView = makeSpeedLineData(ttsFt, ttsRl)

        // this.chart1.avgSpeedJunction = this.chart.avgSpeedChartInView.avgFt
        // this.chart2.avgSpeedJunction = this.chart.avgSpeedChartInView.avgRl
        this.chart1.avgSpeedJunction = avgSpeedFt
        this.chart2.avgSpeedJunction = avgSpeedRl

        // this.chart1.travelTimeJunction = this.chart.travelTimeChartInView.avgFt
        // this.chart2.travelTimeJunction = this.chart.travelTimeChartInView.avgRl
        this.chart1.travelTimeJunction = ttFt
        this.chart2.travelTimeJunction = ttRl
        this.statusText =
          'updated... ' + (new Date().getTime() - start) / 1000 + 'sec'
      }

      this.timer = setTimeout(async () => {
        await updateReward()
      }, 4000)
    }

    updateReward(true)

    window.addEventListener('resize', this.resize)

    const result = await optSvc.getRewardTotal(this.simulation.id)

    const results = Object.values(result.data)

    const total = results[0]
    const label = new Array(total.length).fill(0).map((v, i) => i)
    const reward = total.map(v => Number(v.reward).toFixed(2))
    const avg = total.map(v => Number(v.rewardAvg).toFixed(2))

    this.rewards = makeRewardChart('total', label, reward, avg)

    // this.phaseRewardChartFt = drawChart(this.$refs['phase-reward-ft'], [])
    // this.phaseRewardChartRl = drawChart(this.$refs['phase-reward-rl'], [])

    // this.speedChart1 = drawChart2(this.$refs['chart-avg-speed-junction'], 20)
    // a chart on zoom -> dispatch an action
    // this.phaseRewardChartFt.on('datazoom', params => {
    //   const { start, end, batch } = params

    //   if (batch) {
    //     this.phaseRewardChartRl.dispatchAction({
    //       type: 'dataZoom',
    //       start: start,
    //       end: end,
    //       batch: [
    //         {
    //           startValue: batch[0].startValue,
    //           endValue: batch[0].endValue,
    //           start: batch[0].start,
    //           end: batch[0].end
    //         }
    //       ]
    //     })
    //   } else {
    //     this.phaseRewardChartRl.dispatchAction({
    //       type: 'dataZoom',
    //       start: start,
    //       end: end
    //     })
    //   }

    // })

    // this.phaseRewardChartRl.on('datazoom', function (params) {})
  },
  methods: {
    getRegionName (r) {
      // const map = {
      //   yuseonggu: '유성구',
      //   seogu: '서구',
      //   doan: '도안'
      // }
      return map[r] || r
    },
    toggleView () {
      this.speedView = !this.speedView
    },
    showModal () {
      this.$refs.optenvmodal.show()
    },
    calcEfficency (v1, v2) {
      v1 = Number(v1)
      v2 = Number(v2)
      return ((100 * (v2 - v1)) / ((v2 + v1) / 2)).toFixed(2)
    },
    resize () {
      this.mapHeight = window.innerHeight - 50 // update map height to current height
      // if (this.phaseRewardChartFt) {
      //   this.phaseRewardChartFt.resize()
      // }
      // if (this.phaseRewardChartRl) {
      //   this.phaseRewardChartRl.resize()
      // }
    },
    async runTest () {
      this.showWaitingMsg = true
      this.chart1.avgSpeedsInView = []
      this.chart2.avgSpeedsInView = []
      this.chart1.avgSpeedsJunctions = []
      this.chart2.avgSpeedsJunctions = []

      try {
        await simulationService.stopSimulation(this.simulation.id)
        await optSvc.runTest(
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
      await optSvc
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
