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

// import congestionColor from '@/utils/colors'
import LineChart from '@/components/charts/LineChart'


import UniqCongestionColorBar from '@/components/CongestionColorBar'
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt'
import UniqMapChanger from '@/components/UniqMapChanger'
import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning'
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished'
import toastMixin from '@/components/mixins/toast-mixin'

import UniqCardTitle from '@/components/func/UniqCardTitle'
import * as d3 from 'd3'
import { optimizationService as optSvc } from '@/service'
import signalService from '@/service/signal-service'

import TrafficLightManager from '@/map2/map-traffic-lights'
import map from '@/region-code'

import SignalSystem from '@/actions/action-vis'
import parseAction from '@/actions/action-parser'

import colorScale from '@/utils/colors-improve-rate'

// import lineChartOption from '@/charts/chartjs/line-chart-option'
// import barChartOption from '@/charts/chartjs/bar-chart-option'

const lineChartOption = {
  maintainAspectRatio: false,
  // animation: false,
  spanGaps: true, // enable for all datasets
  responsive: true,
  showLine: true, // disable for a single dataset
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
          fontColor: 'white',
          callback: function (value, index, values) {
            return value + '(s)'
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
  },
  onClick: function (evt, item) {
    // if (callback && item.length > 0) {
    // callback(item[0]._index)
    // }
  }
}

const { log } = window.console

const dataset = (label, color, data) => ({
  label,
  fill: false,
  borderColor: color,
  backgroundColor: color,
  borderWidth: 1,
  pointRadius: 0.5,
  data
})

const makeSpeedLineData = (
  dataFt = [],
  dataRl = [],
  avgTTFT = 0,
  avgTTRL = 0,
  filterStep = 29
) => {

  const datasets = []
  datasets.push(dataset('기존신호', 'grey', dataFt))
  datasets.push(dataset('최적신호', 'orange', dataRl))
  if (avgTTFT > 0) {
    datasets.push(dataset(
      '기존신호(평균)',
      'skyblue',
      new Array(dataRl.length).fill(avgTTFT)
    ))
  }
  if (avgTTRL > 0) {
    datasets.push(
      dataset(
        '최적신호(평균)',
        'yellow',
        new Array(dataRl.length).fill(avgTTRL)
      )
    )
  }
  return {
    labels: new Array(dataRl.length).fill(0).map((_, i) => i * filterStep),
    normalized: true,

    datasets: datasets,
    avgFt: avgTTFT,
    avgRl: avgTTRL
  }
}

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

async function makeSimulationData(region, mapId, slave, eventTarget, mapBus, wsBus, jIds, slaves) {
  const map = makeMap({ mapId: mapId, zoom: 16 })

  const mapManager = MapManager({
    map: map,
    simulationId: slave,
    eventBus: mapBus
  })
  log('make websocket for ', slave)
  const wsClient = WebSocketClient({
    simulationId: slave,
    eventBus: wsBus,
    // region: [127.3449, 36.3873, 127.3807, 36.3694]
    region: map.getExtent()
    // eventBus: mapBus
  })
  const trafficLightManager = TrafficLightManager(map, jIds, eventTarget)
  await trafficLightManager.load(jIds)
  // trafficLightManager.setTargetJunctions(jIds)

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
  data() {
    return {

      simulation: { configuration: {} }, // means optimization
      mapIds: [randomId(), randomId()],
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
        avgSpeedChartInView: {}, // realtime chart
        avgChartJunctions: {},
        effTravelTime: 0,
        travelTimeJunctionChart: {},
        improvement_rate: 0,
      },
      lineChartOption,
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
          epoch: 0,
          result: []
        },
        second: {
          epoch: 0,
          result: []
        }
      }
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

    window.removeEventListener('resize', this.getWindowHeight)
  },
  computed: {
    epochList() {
      // console.log(this.simulation.configuration)
      return this.rewardTotal.filter(v => v.epoch % this.simulation.configuration.modelSavePeriod === 0)
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
      const j = this.optResult.intersections[this.selectedNode]
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
    this.status = simulation.status
    this.simulation = simulation
    this.fixedSlave = simulation.slaves[1]
    this.testSlave = simulation.slaves[0]

    const simEventBusFixed = new Vue({})
    const simEventBusTest = new Vue({})
    const buffer = []
    const wsBus = new Vue({})
    this.simulations = [
      await makeSimulationData(
        this.simulation.configuration.region,
        this.mapIds[0],
        this.fixedSlave,
        this,
        simEventBusFixed,
        wsBus,
        this.simulation.configuration.junctionId.split(','),
        [this.fixedSlave, this.testSlave]
      ),
      await makeSimulationData(
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

    const center = this.simulation.configuration.center
    if (center) {
      this.simulations[0].map.animateTo({
        center: [center.x, center.y]
      })
    }

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
      this.showWaitingMsg = false
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
      // this.showWaitingMsg = false

      if (status.progress >= 99) {
        this.chart2.progress = 100
        this.chart1.progress = 100
      }

      if (status.progress > 100) {
        this.chart2.progress = 0
        this.chart1.progress = 0
      }
    })

    busFixed.$on('optimization:finished', () => {
      this.checkStatus()
    })

    busFixed.$on('ws:error', error => {
      this.makeToast(error.message, 'warning')
    })

    this.$on('junction:clicked', async p => {
      const crossName = signalService.nodeIdToName(p.nodeId)
      this.selectedNode = crossName
      this.selectCrossName(crossName)
    })

    this.updateOptResult(true)
    this.updateRewardTotal()

    this.initKeyListener()
    this.resize()

    window.scrollTo(0, 0)
    window.addEventListener('resize', this.resize.bind(this))


  },
  methods: {
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
        this.optTestResult[type].result = result
      } catch (err) {
        log(err.message)
      }
    },
    getColorForImprovedRate(v) {
      return colorScale(v)
    },
    async updateOptResult(forceUpdate) {
      const start = new Date().getTime()
      const progress = this.chart1.progress
      if ((progress > 0 && progress < 100) || forceUpdate) {
        this.statusText = 'chart created...' + +(Date.now() - start) / 1000


        // const result = await optSvc.getOptTestResult(this.simulation.id, 0)
        // this.optTestResult = result
        // console.log(result)
        try {
          //
          const optResult = await optSvc.getSigOptResult(this.simulation.id).then(res => res.data)
          this.optResult = optResult

          log(optResult)
          this.simulations[1].trafficLightManager.setOptTestResult(optResult.intersections, 'test')
          this.simulations[0].trafficLightManager.setOptTestResult(optResult.intersections, 'simulate')

          // this.simulations[1].trafficLightManager.setOptResult2(this.optTestResult, 'test')
          // this.simulations[0].trafficLightManager.setOptResult2(this.optTestResult, 'simulate')

          this.chart.travelTimeChartInView = makeSpeedLineData(
            optResult.simulate.travel_times.filter((v, i) => i % 29 === 0),
            optResult.test.travel_times.filter((v, i) => i % 29 === 0),
            optResult.simulate.travel_time,
            optResult.test.travel_time,
            29
          )
          this.chart.travelTimeChartInViewAcc = makeSpeedLineData(
            optResult.simulate.cumlative_avgs.filter((v, i) => i % 29 === 0),
            optResult.test.cumlative_avgs.filter((v, i) => i % 29 === 0),
            // optResult.simulate.travel_time,
            // optResult.test.travel_time,
            0,
            0,
            29
          )

          const d = this.optResult.intersections[this.selectedNode]
          if (d) {
            this.chart.travelTimeJunctionChart = makeSpeedLineData(
              d.simulate.cumlative_avgs.filter((v, i) => i % 29 === 0),
              d.test.cumlative_avgs.filter((v, i) => i % 29 === 0),
              d.simulate.travel_time,
              d.test.travel_time,
              29
            )

            this.chart.travelTimeJunctionChartAcc = makeSpeedLineData(
              d.simulate.travel_times.filter((v, i) => i % 29 === 0),
              d.test.travel_times.filter((v, i) => i % 29 === 0),
              d.simulate.travel_time,
              d.test.travel_time,
              29
            )

          }

          this.chart.travelTimePerJunction = optResult.intersections

          this.chart.effTravelTime = optResult.improvement_rate

          this.chart1.travelTimeJunction = optResult.simulate.travel_time
          this.chart1.avgSpeedJunction = optResult.simulate.avg_speed

          this.chart2.travelTimeJunction = optResult.test.travel_time
          this.chart2.avgSpeedJunction = optResult.test.avg_speed

          this.statusText = 'updated... ' + (Date.now() - start) / 1000 + ' sec'

          if (this.signalExplain === null) {
            setTimeout(() => {
              this.updateSignalExplain()
            }, 2000)
          } else {
            this.statusText = '신호정보 업데이트'
            this.signalExplain.update(parseAction(this.actionForOpt[1].action))
          }
        } catch (err) {
          // this.statusText = err.message
          log(err.message)
          if (err.response) {
            // this.statusText = err.response.data
            log(err.response.data)
            this.status = 'error'

          }
        }
      }

      this.timer = setTimeout(async () => {
        try {
          await this.updateOptResult()
        } catch (err) {
          log(err.message)
        }
      }, 4000)
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
      this.selectedNode = crossName
      if (!this.optResult) {
        return
      }
      if (!this.optResult.intersections) {
        return
      }
      const result = this.optResult.intersections[crossName]
      if (result) {
        // this.chart.travelTimeJunctionChart = makeSpeedLineData(
        //   d.simulate.cumlative_avgs,
        //   d.test.cumlative_avgs,
        //   0,// d.simulate.travel_time,
        //   0,// d.test.travel_time,
        //   1
        // )

        this.chart.travelTimeJunctionChart = makeSpeedLineData(
          result.simulate.cumlative_avgs.filter((v, i) => i % 29 === 0),
          result.test.cumlative_avgs.filter((v, i) => i % 29 === 0),
          0, // d.simulate.travel_time,
          0, // d.test.travel_time,
          29
        )
        this.chart.travelTimeJunctionChartAcc = makeSpeedLineData(
          result.simulate.travel_times.filter((v, i) => i % 29 === 0),
          result.test.travel_times.filter((v, i) => i % 29 === 0),
          result.simulate.travel_time,
          result.test.travel_time,
          29
        )
      }

      this.isShowAvgTravelChart = true

      this.currentTab = ''
      this.updateSignalExplain()

      this.simulations[1].trafficLightManager.moveTo(crossName)

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
      this.mapHeight = window.innerHeight - 205 // update map height to current height
    },

    async runTest() {
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
      this.checkStatus()
    },

    initMapEventHandler(obj) {
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

        return async e => {
          if (e.target.id === map1.id) {
            moveTo(map2, e.target)

            // const result = await optSvc.getOptTestResult(this.simulation.id, 0)
            // this.optTestResult = result
            // try {
            //   //
            //   const optResult = await optSvc.getSigOptResult(this.simulation.id).then(res => res.data)
            //   this.optResult = optResult

            //   log(optResult)

            //   this.simulations[1].trafficLightManager.setOptResult2(this.optTestResult, 'test')
            //   this.simulations[0].trafficLightManager.setOptResult2(this.optTestResult, 'simulate')
            // } catch (err) {
            //   log(err.message)
            // }

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
      simulationService.getSimulationInfo(this.simulation.id).then(data => {
        this.status = data.simulation.status
      })
    }
  }
}
