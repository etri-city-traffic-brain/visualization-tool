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

import SignalSystem from '@/actions/action-vis'
import parseAction from '@/actions/action-parser'

const { log } = window.console

const calcAvg = (values = []) => {
  if (!Array.isArray(values)) {
    return 0
  }

  if (values.length === 0) {
    return 0
  }

  return (
    values.reduce((acc, cur) => {
      return acc + cur
    }, 0) / values.length
  )
}

function zeroFill (len) {
  return new Array(len).fill(0)
}

function calcAverage (data) {
  const values = Object.values(data)
  if (values.length < 1) {
    return [0, [], 0]
  }

  let sumAvgSpeed = 0
  let sumPassed = 0
  let sumTravelTime = 0
  let cnt = 0

  let sumTravelTimes
  let sumPasseds
  let avgSpeeds

  const avgTravelTimesPerStep = Object.create(null)

  for (let i = 0; i < values.length; i++) {
    const steps = values[i].length
    sumTravelTimes = zeroFill(steps)
    sumPasseds = zeroFill(steps)
    avgSpeeds = zeroFill(steps)

    // 교차로
    for (let j = 0; j < steps; j++) {
      const target = values[i][j]
      sumTravelTimes[j] += Number(target.sumTravelTime)
      sumPasseds[j] += Number(target.sumPassed)
      avgSpeeds[j] += Number(target.avgSpeed)
      sumAvgSpeed = sumAvgSpeed + Number(target.avgSpeed)
      sumPassed = sumPassed + Number(target.sumPassed)
      sumTravelTime = sumTravelTime + Number(target.sumTravelTime)
      cnt += 1

      const tt = avgTravelTimesPerStep[target.step] || []

      const avgTT = target.sumTravelTime / target.sumPassed

      if (!Number.isNaN(avgTT)) {
        tt.push(avgTT)
      }

      avgTravelTimesPerStep[target.step] = tt
    }
  }

  let avgTravelTimes = Object.values(avgTravelTimesPerStep).map(calcAvg)

  return [sumTravelTime / sumPassed, avgTravelTimes, sumAvgSpeed / cnt]
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

const makeSpeedLineData = (
  dataFt = [],
  dataRl = [],
  avgTTRL = 0,
  avgTTFT = 0
) => {
  let avgFt = dataFt.reduce((acc, cur) => (acc += ~~cur), 0) / dataFt.length
  let avgRl = dataRl.reduce((acc, cur) => (acc += ~~cur), 0) / dataRl.length

  avgFt = avgFt.toFixed(2)
  avgRl = avgRl.toFixed(2)

  return {
    labels: new Array(dataRl.length).fill(0).map((_, i) => i),
    normalized: true,

    datasets: [
      dataset(
        '기존신호(평균)',
        'skyblue',
        new Array(dataRl.length).fill(avgTTFT)
      ),
      dataset(
        '최적신호(평균)',
        'yellow',
        new Array(dataRl.length).fill(avgTTRL)
      ),
      dataset('기존신호', 'grey', dataFt),
      dataset('최적신호', 'orange', dataRl)
    ],
    avgFt: avgFt,
    avgRl: avgRl
  }
}

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

const initSimulationData = async (
  region,
  mapId,
  slave,
  eventTarget,
  mapBus,
  wsBus,
  jIds,
  slaves
) => {
  const center =
    region === 'cdd3' ? [127.3549527, 36.385148] : [127.3396677, 36.3423342]

  const map = makeMap({ mapId: mapId, zoom: 16, center })

  const mapManager = MapManager({
    map: map,
    simulationId: slave,
    eventBus: mapBus
  })

  const wsClient = WebSocketClient({
    simulationId: slave,
    eventBus: wsBus,
    // region: [127.3449, 36.3873, 127.3807, 36.3694]
    region: map.getExtent()
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
        junctionSpeeds: {},
        effTravelTime: 0
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
        labels: [],
        values: []
      },
      phaseFixed: {},
      phaseTest: {},
      testSlave: null,
      fixedSlave: null,
      selectedEpoch: 0,
      showEpoch: false,
      trafficLightManager: null,
      selectedNode: '',
      showWaitingMsg: false,
      avgSpeedJunction: 0,
      statusMessage: [],
      timer: null,
      statusText: '',
      // speedView: false,
      ss: null,
      isShowAvgTravelChart: false
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
    travelTimePerJunction () {
      const keys = Object.keys(this.chart2.speedsPerJunction)
      const ttsFt = this.chart1.speedsPerJunction
      const ttsRl = this.chart2.speedsPerJunction
      const result = {}
      for (let i = 0; i < keys.length; i++) {
        const jId = keys[i]
        const vFt = ttsFt[jId] || []
        const vRl = ttsRl[jId] || []
        const ttFt = calcAvg(vFt.map(v => Number(v.avgTravelTime))).toFixed(2)
        const ttRl = calcAvg(vRl.map(v => Number(v.avgTravelTime))).toFixed(2)
        result[jId] = [ttFt, ttRl, (((ttFt - ttRl) / ttFt) * 100).toFixed(2)]
      }
      return result
    },
    actionForOpt () {
      const info = this.chart2.speedsPerJunction
      const s = this.selectedNode
      const t = info[s]

      if (t) {
        return [t[0], t[t.length - 1]]
      }
      return [{}, {}]
    }
  },
  async mounted () {
    window.scrollTo(0, 0)

    document.addEventListener('keydown', event => {
      // if (event.ctrlKey && event.keyCode === 90) {
      //   this.isShowAvgTravelChart = !this.isShowAvgTravelChart
      // }
      if (event.keyCode === 67) {
        this.isShowAvgTravelChart = !this.isShowAvgTravelChart
        // window.scrollTo(0, 1000)
        setTimeout(() => {
          window.scrollTo({
            left: 0,
            top: document.body.scrollHeight,
            behavior: 'smooth'
          })
        }, 500)
      }
    })

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
        this.simulation.configuration.region,
        this.mapIds[0],
        this.fixedSlave,
        this,
        simEventBusFixed,
        wsBus,
        this.simulation.configuration.junctionId.split(','),
        [this.fixedSlave, this.testSlave]
      ),
      await initSimulationData(
        this.simulation.configuration.region,
        this.mapIds[1],
        this.testSlave,
        this,
        simEventBusTest,
        simEventBusTest,
        this.simulation.configuration.junctionId.split(','),
        [this.fixedSlave, this.testSlave]
      )
    ]

    this.initMapEventHandler(this)

    const busFixed = simEventBusFixed
    const busTest = simEventBusTest

    wsBus.$on('salt:data', data => {
      buffer.push(data)
    })

    let boundingBoxSet = false

    // 최적화 시뮬레이션이 수행 속도가 느림
    // 버퍼로부터 데이터 가져와 이벤트 발생
    busTest.$on('salt:data', () => {
      const dataSim = buffer.splice(0, 1)[0]
      if (dataSim) {
        simEventBusFixed.$emit('salt:data', dataSim)

        if (!boundingBoxSet) {
          setTimeout(() => {
            const map1 = this.simulations[0].map
            const map2 = this.simulations[1].map
            map1.animateTo({
              center: map1.getCenter(),
              zoom: map1.getZoom() + 1
            })
            map2.animateTo({
              center: map2.getCenter(),
              zoom: map2.getZoom() + 1
            })
          }, 500)
          boundingBoxSet = true
        }
      }
    })

    busTest.$on('salt:status', async status => {
      this.chart2.progress = status.progress
      this.chart1.progress = status.progress
      this.showWaitingMsg = false

      if (status.progress >= 99) {
        this.chart2.progress = 100
        this.chart1.progress = 100
      }
    })

    busFixed.$on('optimization:finished', () => {
      this.checkStatus()
    })

    // wsBus.$on('salt:status', async () => {})
    // wsBus.$on('salt:finished', async () => {})
    // busFixed.$on('salt:data', () => {})
    // busTest.$on('salt:finished', () => {})
    // busFixed.$on('ws:close', () => {})
    // this.$on('signalGroup:clicked', () => {})

    busFixed.$on('ws:error', error => {
      this.makeToast(error.message, 'warning')
    })

    this.$on('junction:clicked', async p => {
      const crossName = signalService.nodeIdToName(p.nodeId)
      this.selectedNode = crossName

      this.initSignaSystem()
    })

    const updateReward = async forceUpdate => {
      const start = new Date().getTime()
      const progress = this.chart1.progress
      if ((progress > 0 && progress < 100) || forceUpdate) {
        this.statusText = 'loading data...'

        const [dataRl, dataFt] = await Promise.all([
          optSvc.getPhaseReward(this.simulation.id, 'rl').then(res => res.data),
          optSvc.getPhaseReward(this.simulation.id, 'ft').then(res => res.data)
        ])
        // this.statusText = 'loaded ' + (Date.now() - start) / 1000

        // log(new Date().getTime() - start)
        // this.statusText = '데이터 로드 완료'

        this.chart1.speedsPerJunction = dataFt // simulate
        this.chart2.speedsPerJunction = dataRl // optimization
        this.statusText = 'calculating average travel time'
        const [avgTTRL, avgTTRLs, avgSpdRl] = calcAverage(dataRl)

        const [avgTTFT, avgTTFTs, avgSpdFt] = calcAverage(dataFt)

        const diffTT = avgTTFT - avgTTRL
        if (diffTT === 0) {
          this.chart.effTravelTime = 0
        } else {
          this.chart.effTravelTime = (diffTT / avgTTFT) * 100
        }
        this.statusText = 'building travel time chart '
        // chart: average travel time
        this.chart.travelTimeChartInView = makeSpeedLineData(
          avgTTFTs,
          avgTTRLs,
          avgTTRL,
          avgTTFT
        )
        this.statusText = 'chart created...' + +(Date.now() - start) / 1000

        // this.statusText = '평균통과시간 계산완료'

        // this.chart1.avgSpeedJunction = this.chart.avgSpeedChartInView.avgFt
        // this.chart2.avgSpeedJunction = this.chart.avgSpeedChartInView.avgRl

        this.chart1.avgSpeedJunction = avgSpdFt ? avgSpdFt.toFixed(2) : '0.00'
        this.chart2.avgSpeedJunction = avgSpdRl ? avgSpdRl.toFixed(2) : '0.00'

        this.chart1.travelTimeJunction = avgTTFT
        this.chart2.travelTimeJunction = avgTTRL
        this.statusText = 'updated... ' + (Date.now() - start) / 1000 + ' sec'

        if (this.ss === null) {
          setTimeout(() => {
            this.initSignaSystem()
          }, 2000)
        } else {
          const str2 = this.actionForOpt[1].action
          const o2 = parseAction(str2)
          this.statusText = '신호정보 업데이트'
          this.sss && this.ss.update(o2.offset, o2.duration)
        }
      }

      this.timer = setTimeout(async () => {
        try {
          await updateReward()
        } catch (err) {
          log(err.message)
        }
      }, 4000)
    }

    updateReward(true)
    window.addEventListener('resize', this.resize)

    this.updateRewardTotal()
  },
  methods: {
    async updateRewardTotal () {
      const result = await optSvc.getRewardTotal(this.simulation.id)

      const results = Object.values(result.data)

      const total = results[0]
      if (!total) {
        this.statusText = '모델파일 없음'
        return
      }
      const labels = new Array(total.length).fill(0).map((v, i) => i)
      const rewards = total.map(v => Number(v.reward).toFixed(2))
      // const avg = total.map(v => Number(v.rewardAvg).toFixed(2))
      // this.rewards = makeRewardChart('total', label, reward, avg)
      this.rewards.labels = labels
      this.rewards.values = rewards
    },
    initSignaSystem () {
      const container = this.$refs.actionvis

      if (this.actionForOpt.length < 1) {
        return
      }
      const actionFt = this.actionForOpt[0].action

      const rFt = parseAction(actionFt)
      if (!rFt) {
        // log('parse action failed:', actionFt)
        return
      }
      this.ss = SignalSystem(container, {
        offset: rFt.offset,
        duration: rFt.duration
      })
      const actionRl = this.actionForOpt[1].action
      const rRl = parseAction(actionRl)
      this.ss.update(rRl.offset, rRl.duration)

      log('대상교차로:', this.selectedNode)
      log('기존신호:', this.actionForOpt[0].action)
      log('최적신호:', this.actionForOpt[1].action)
    },
    getRegionName (region) {
      return map[region] || region
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
      this.mapHeight = window.innerHeight - 220 // update map height to current height
    },
    height () {
      return window.innerHeight
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
    initMapEventHandler (obj) {
      const map1 = this.simulations[0].map
      const map2 = this.simulations[1].map

      const moveHandler = (map1, map2) => {
        const moveTo = (map, target) => {
          if (map1.isZooming() || map2.isZooming()) {
            return
          }
          obj.buffer = [] // init buffer
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
