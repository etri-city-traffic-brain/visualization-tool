/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */

import Vue from 'vue'
import gsap from 'gsap'
import makeMap from '@/map2/make-map'
import MapManager from '@/map2/map-manager'

import WebSocketClient from '@/realtime/ws-client'

import simulationService from '@/service/simulation-service'

import SimulationResult from '@/pages/SimulationResult.vue'

import LineChart from '@/components/charts/LineChart'

import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import UniqMapChanger from '@/components/UniqMapChanger'
import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'
import toastMixin from '@/components/mixins/toast-mixin'

import UniqCardTitle from '@/components/func/UniqCardTitle'

import { optimizationService as optSvc } from '@/service'
import signalService from '@/service/signal-service'

import TrafficLightManager from '@/map2/map-traffic-lights'
import map from '@/region-code'

import SignalSystem from '@/actions/action-vis'
import parseAction from '@/actions/action-parser'

import colorScale from '@/utils/colors-improve-rate'

const lineChartOption = {
  maintainAspectRatio: false,
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
    enabled: false
  },
  scales: {
    xAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: '시뮬레이션시간(초)',
          fontColor: 'white',
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 50,
          maxRotation: 0,
          display: true,
          fontColor: 'white',
          // callback: function (value) {
          //   return value + ''
          // }
        }
      }
    ],
    yAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: '통과시간(초)',
          fontColor: 'white',
        },
        ticks: {
          autoSkip: true,
          autoSkipPadding: 15,
          maxRotation: 0,
          display: true,
          fontColor: 'white',
          // callback: function (value) {
          //   return value + '(초)'
          // }
        }
      }
    ]
  },
  legend: {
    display: true,
    labels: {
      fontColor: 'white',
      fontSize: 12,
      filter: function (item, chart) {
        // Logic to remove a particular legend item goes here
        return !item.text.includes('hide');
      }
    }
  },
}

const { log } = window.console

function makeTravelTimeChart(dataFt = [], dataRl = [], avgTTFT = 0, avgTTRL = 0, step) {

  function dataset(label, color, data) {
    return {
      label,
      fill: false,
      borderColor: color,
      backgroundColor: color,
      borderWidth: 1,
      pointRadius: 0.5,
      data
    }
  }

  const dataLength = dataRl.length
  const datasets = []
  datasets.push(dataset('기존신호', 'gray', dataFt))
  datasets.push(dataset('최적신호', 'orange', dataRl))
  if (avgTTFT > 0) {
    datasets.push(dataset('hide', 'lightgray', new Array(dataLength).fill(avgTTFT)))
  }
  if (avgTTRL > 0) {
    datasets.push(dataset('hide', 'darkorange', new Array(dataLength).fill(avgTTRL)))
  }

  return {
    labels: new Array(dataLength).fill(0).map((_, i) => i * step),
    normalized: true,
    datasets: datasets,
  }
}

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

async function makeSimulationData(mapId, sId, eventTarget, mapBus, wsBus, jIds, slaves) {
  const map = makeMap({ mapId: mapId, zoom: 16 })
  const mapManager = MapManager({
    map: map,
    simulationId: sId,
    eventBus: mapBus
  })
  const wsClient = WebSocketClient({
    simulationId: sId,
    eventBus: wsBus,
    region: map.getExtent()
  })
  const trafficLightManager = TrafficLightManager(map, jIds, eventTarget)
  await trafficLightManager.load(jIds)

  mapManager.loadMapData()
  wsClient.init(slaves)

  return {
    map,
    mapManager,
    wsClient,
    bus: mapBus,
    trafficLightManager,
    slave: sId
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
  data() {
    return {
      simulation: { configuration: {} }, // means optimization
      mapIdFt: randomId(),
      mapIdRl: randomId(),

      simulations: null,
      mapHeight: 600,
      chart1: { // 기존신호
        avgSpeedJunction: 0,
        travelTimeJunction: 0,
        progress: 0,
        data: {},
      },
      chart2: { // 최적신호
        avgSpeedJunction: 0,
        travelTimeJunction: 0,
        progress: 0,
        data: {},
      },
      chart: {
        travelTimeJunctionChart: {},
        travelTimeJunctionChartAcc: {},
      },
      lineChartOption,
      rewards: {
        labels: [],
        values: []
      },
      simIdRl: null,
      simIdFt: null,
      selectedEpoch: 0,
      showEpoch: false,
      trafficLightManager: null,
      crossNameSelected: '',
      showWaitingMsg: false,
      showWaitingMsg2: false,
      statusMessage: [],
      timer: null,
      status: '',
      statusText: '',
      signalExplain: null,
      isShowAvgTravelChart: true,
      currentTab: 'total',
      optResult: {},
      animated: {
        improvement_rate: 0,
        chart1_avgSpeedJunction: 0,
        chart1_travelTimeJunction: 0,
        chart2_avgSpeedJunction: 0,
        chart2_travelTimeJunction: 0,
      },
      rewardTotal: [],
      optTestResult: {
        first: {
          epoch: -1,
          result: []
        },
        second: {
          epoch: -1,
          result: []
        }
      },
      optTestResults: [],
      step: 29,
      testResult: null,
      waitingMessage: '실행 준비 중입니다. 잠시 후 실행 됩니다.',
      needToMove: true,
      factor: 0.001,
      showPopup: false
    }
  },
  watch: {
    optResult(value) {
      gsap.to(this.animated, {
        improvement_rate: value.improvement_rate,
        chart1_avgSpeedJunction: value.simulate.avg_speed,
        chart1_travelTimeJunction: value.simulate.travel_time,
        chart2_avgSpeedJunction: value.test.avg_speed,
        chart2_travelTimeJunction: value.test.travel_time,
      })
    },

  },
  destroyed() {
    this.simulations.forEach(({ map, wsClient }) => {
      map.remove()
      wsClient.close()
    })

    if (this.timer) {
      clearTimeout(this.timer)
    }

    if (this.checkStatusTimer) {
      clearTimeout(this.checkStatusTimer)
    }

    window.removeEventListener('resize', this.getWindowHeight)
  },
  computed: {
    epochList() {
      return (this.rewardTotal || []).filter(v => v.epoch % this.simulation.configuration.modelSavePeriod === 0)
        .map(v => {
          return {
            ...v,
            checked: this.optTestResults.includes(v.epoch)
          }
        })
    },
    config() {
      if (this.simulation) {
        return this.simulation.configuration
      } else {
        return {}
      }
    },

    actionForOpt() {
      if (!this.optResult) {
        return [{}, {}]
      }
      const j = this.optResult.intersections[this.crossNameSelected]
      if (!j) {
        return [{}, {}]
      }
      return [j.simulate.signal_explain, j.test.signal_explain] // step first and step last
    }
  },
  async mounted() {
    const optimizationId = this.$route.params.id

    if (!optimizationId) {
      log("optimization id is missed")
      return
    }

    const { simulation } = await simulationService.getSimulationInfo(optimizationId)


    if (!simulation) {
      log("cannot find optimization information")
      return
    }

    optSvc.getOptTestResults(simulation.id).then(result => {
      this.optTestResults = result
    })

    this.status = simulation.status
    this.simulation = simulation
    this.simIdFt = simulation.slaves[1]
    this.simIdRl = simulation.slaves[0]
    const simEventBusFixed = new Vue({})
    const simEventBusTest = new Vue({})
    const bufferSimFt = []
    const wsBus = new Vue({})

    const { junctionId, center } = this.simulation.configuration

    const jIds = junctionId.split(',')

    this.simulations = [
      await makeSimulationData(
        this.mapIdFt,
        this.simIdFt,
        this,
        simEventBusFixed,
        wsBus,
        jIds,
        [this.simIdFt, this.simIdRl]
      ),
      await makeSimulationData(
        this.mapIdRl,
        this.simIdRl,
        this,
        simEventBusTest,
        simEventBusTest,
        jIds,
        [this.simIdFt, this.simIdRl]
      )
    ]
    const mapFt = this.simulations[0].map

    if (center) {
      mapFt.animateTo({
        center: [center.x, center.y]
      })
    }

    this.initMapEventHandler(this)

    const evtBusFt = simEventBusFixed
    const evtBusRl = simEventBusTest

    wsBus.$on('salt:data', data => {
      bufferSimFt.push(data)
    })

    let boundingBoxSet = false

    // 최적화 시뮬레이션이 수행 속도가 느림
    // 버퍼로부터 데이터 가져와 이벤트 발생
    evtBusRl.$on('salt:data', () => {
      // this.showWaitingMsg = false
      const dataSim = bufferSimFt.shift()
      if (!dataSim) {
        return
      }

      simEventBusFixed.$emit('salt:data', dataSim)

      if (!boundingBoxSet) {
        setTimeout(() => mapFt.animateTo({ center: mapFt.getCenter(), zoom: mapFt.getZoom() + 1 }), 500)
        boundingBoxSet = true
      }

    })

    evtBusRl.$on('salt:status', async status => {

      if (status.progress > 1 && status.progress < 1000) {
        // this.count += 1
        if (this.needToMove) {
          const mapFt = this.simulations[0].map
          if (center) {
            mapFt.animateTo({
              center: [center.x - this.factor, center.y]
            })
            this.factor += 0.001
          }
          this.needToMove = false
        }
      }


      this.chart2.progress = status.progress
      this.chart1.progress = status.progress

      if (status.progress >= 95) {
        this.chart1.progress = 100
        this.chart2.progress = 100

        this.showWaitingMsg2 = true

      }

      if (status.progress > 100) {
        this.chart1.progress = 0
        this.chart2.progress = 0
        this.showWaitingMsg2 = false
      }
    })

    evtBusFt.$on('salt:data', () => {

      this.showWaitingMsg = false
    })

    evtBusFt.$on('optimization:finished', () => {

    })

    evtBusFt.$on('ws:error', err => {
      log(err.message)
    })

    this.$on('junction:clicked', async param => {
      const crossName = signalService.nodeIdToName(param.nodeId)
      this.crossNameSelected = crossName
      this.selectCrossName(crossName)
    })

    this.updateOptResult(true)
    this.updateRewardTotal()

    this.initKeyListener()
    this.resize()

    window.scrollTo(0, 0)
    window.addEventListener('resize', this.resize.bind(this))

    this.checkStatus()
  },
  methods: {
    getActionName(v) {
      const o = {
        offset: '옵셋 조정',
        kc: '즉시 신호 변경',
        gr: '녹색시간 조정',
        gro: '녹색시간과 옵셋 조정',
        gt: '현시 최소최대 만족(gt)',
        ga: '현시 주기 만족(ga)',
      }
      return o[v] || '모름'
    },
    getRewardFunctionName(v) {
      const o = {
        pn: '통과 차량 수',
        wt: '대기 시간',
        tt: '통과 소요 시간',
        wq: '대기 큐 길이(wq)',
        cwq: '축적된 대기 큐 길이'
      }
      return o[v] || '모름'
    },
    colorScale,

    getEff(idx) {
      return (100 - (this.optTestResult.first.result[idx].rlAvgTravelTime / this.optTestResult.second.result[idx].rlAvgTravelTime) * 100).toFixed(2)
    },

    getProgressColor(v) {
      return v > 0 ? 'success' : 'danger'
    },

    async loadTestResult(type, epoch) {
      try {
        const result = await optSvc.getOptTestResult(this.simulation.id, epoch)
        this.optTestResult[type].result = result.result
      } catch (err) {
        log(err.message)
      }
    },
    getColorForImprovedRate(v) {
      return colorScale(v)
    },

    async updateOptResult(forceUpdate) {
      log('update optimization result', new Date())
      // const start = new Date().getTime()
      const progress = this.chart1.progress
      if ((progress > 0 && progress < 100) || forceUpdate) {
        // this.statusText = 'chart created...' + +(Date.now() - start) / 1000
        try {
          const optResult = await optSvc.getSigOptResult(this.simulation.id).then(res => res.data)
          this.optResult = optResult

          this.simulations[1].trafficLightManager.setOptTestResult(optResult.intersections, 'test')
          this.simulations[0].trafficLightManager.setOptTestResult(optResult.intersections, 'simulate')

          const step = this.step
          this.chart.travelTimeChartInView = makeTravelTimeChart(
            optResult.simulate.travel_times.filter((v, i) => i % step === 0),
            optResult.test.travel_times.filter((v, i) => i % step === 0),
            optResult.simulate.travel_time,
            optResult.test.travel_time,
            step
          )
          this.chart.travelTimeChartInViewAcc = makeTravelTimeChart(
            optResult.simulate.cumlative_avgs.filter((v, i) => i % step === 0),
            optResult.test.cumlative_avgs.filter((v, i) => i % step === 0),
            0, 0,
            step
          )

          const r = this.optResult.intersections[this.crossNameSelected]
          if (r) {
            this.chart.travelTimeJunctionChart = makeTravelTimeChart(
              r.simulate.travel_times.filter((v, i) => i % step === 0),
              r.test.travel_times.filter((v, i) => i % step === 0),
              r.simulate.travel_time,
              r.test.travel_time,
              step
            )

            this.chart.travelTimeJunctionChartAcc = makeTravelTimeChart(
              r.simulate.cumlative_avgs.filter((v, i) => i % 29 === 0),
              r.test.cumlative_avgs.filter((v, i) => i % 29 === 0),
              0,
              0,
              29
            )

            this.testResult = r

          }

          this.chart.travelTimePerJunction = optResult.intersections

          this.chart.effTravelTime = optResult.improvement_rate

          this.chart1.travelTimeJunction = optResult.simulate.travel_time
          this.chart1.avgSpeedJunction = optResult.simulate.avg_speed

          this.chart2.travelTimeJunction = optResult.test.travel_time
          this.chart2.avgSpeedJunction = optResult.test.avg_speed

          // this.statusText = 'updated... ' + (Date.now() - start) / 1000 + ' sec'

          if (this.signalExplain === null) {
            setTimeout(() => {
              this.updateSignalExplain()
            }, 2000)
          } else {
            this.statusText = '신호정보 업데이트'
            this.signalExplain.update(parseAction(this.actionForOpt[1].action))
          }
        } catch (err) {
          log(err)
          if (err.response) {
            log(err.response.data)
            this.status = 'error'
          }
        }
      }

      this.timer = setTimeout(async () => {
        try {
          // if (this.status === 'finished') {
          //   return
          // }
          await this.updateOptResult()
        } catch (err) {
          log(err.message)
        }
      }, 5000)
    },

    initKeyListener() {
      document.addEventListener('keydown', event => {
        if (event.key === 'c') { // 'c'
          this.isShowAvgTravelChart = !this.isShowAvgTravelChart
          if (!this.currentTab) {
            this.updateSignalExplain()
          }
        }
      })
    },

    async selectCrossName(crossName) {
      this.crossNameSelected = crossName
      this.isShowAvgTravelChart = true
      this.currentTab = ''
      this.showPopup = true
      this.updateSignalExplain()

      this.simulations[1].trafficLightManager.moveTo(crossName)

      if (!this.optResult) {
        return
      }
      if (!this.optResult.intersections) {
        return
      }
      const r = this.optResult.intersections[crossName]
      if (!r) {
        return
      }
      const step = this.step
      const stepFilter = (v, i) => i % step === 0
      this.chart.travelTimeJunctionChart = makeTravelTimeChart(
        r.simulate.travel_times.filter(stepFilter),
        r.test.travel_times.filter(stepFilter),
        r.simulate.travel_time,
        r.test.travel_time,
        step
      )

      this.chart.travelTimeJunctionChartAcc = makeTravelTimeChart(
        r.simulate.cumlative_avgs.filter(stepFilter),
        r.test.cumlative_avgs.filter(stepFilter),
        0,
        0,
        step
      )
      this.testResult = r
    },

    async updateRewardTotal() {
      const result = await optSvc.getRewardTotal(this.simulation.id)

      const results = Object.values(result.data)
      this.rewardTotal = results[0]
      const total = results[0]
      if (!total) {
        this.statusText = '모델파일 없음'
        return
      }
      const labels = new Array(total.length).fill(0).map((v, i) => i)
      const rewards = total.map(v => Number(v.reward).toFixed(2))
      this.rewards.labels = labels
      this.rewards.values = rewards
    },

    updateSignalExplain() {
      const container = this.$refs.actionvis
      if (!container) {
        setTimeout(() => {
          this.updateSignalExplain()
        }, 100)
        return
      }

      this.signalExplain = SignalSystem(container, parseAction(this.actionForOpt[0]))
      this.signalExplain.update(parseAction(this.actionForOpt[1]))

    },

    getRegionName(region) {
      return map[region] || region
    },

    showModal() {
      this.$refs.optenvmodal.show()
    },

    resize() {
      this.mapHeight = window.innerHeight - 195 // update map height to current height
    },

    async runTest() {
      this.showWaitingMsg = true
      this.chart1.avgSpeedsInView = []
      this.chart2.avgSpeedsInView = []
      this.chart1.avgSpeedsJunctions = []
      this.chart2.avgSpeedsJunctions = []
      this.chart1.progress = 0
      this.chart2.progress = 0
      this.needToMove = true
      try {
        await simulationService.stopSimulation(this.simulation.id)
        await optSvc.runTest(
          this.simulation.id,
          this.simIdRl,
          this.selectedEpoch
        )
      } catch (err) {
        log(err.message)
        this.status = 'error'
      }
      this.status = 'running'
      // this.checkStatus()
      // this.updateOptResult()
    },

    addMessage(msg) {
      this.statusMessage.push(msg)
      if (this.statusMessage.length > 100) {
        this.statusMessage.shift()
      }
    },

    async stopTest() {
      this.status = 'stopping'
      this.addMessage('stop ' + this.simulation.id)
      await optSvc
        .stop(this.simulation.id, 'slave')
        .then(r => r.data)
        .then(data => {
          this.addMessage(data.msg)
        })
    },

    initMapEventHandler(obj) {
      const map1 = this.simulations[0].map
      const map2 = this.simulations[1].map

      const moveHandler = (map1, map2) => {
        const moveTo = (map, target) => {
          if (map1.isZooming() || map2.isZooming()) {
            return
          }
          obj.bufferSimFt = []
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
        return async e => {
          if (map1.isMoving() || map2.isMoving()) {
            return
          }
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

    async checkStatus() {
      try {
        const data = await simulationService.getSimulationInfo(this.simulation.id)
        this.status = data.simulation.status
        log('check status:', this.status)
      } catch (err) {
        log('check status error: ', err.message)
      }
      if (this.status === 'finished') {
        this.chart1.progress = 100
        this.chart2.progress = 100
        // this.updateOptResult(true)
      }
      if (this.status === 'finished' || this.status === 'error' || this.status === 'stopped') {
        this.showWaitingMsg = false
        this.showWaitingMsg2 = false
        //   return
      }
      this.checkStatusTimer = setTimeout(() => {
        this.checkStatus()
      }, 5000)
    }
  }
}
