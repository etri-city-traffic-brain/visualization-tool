/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */

import Vue from 'vue';

import StepPlayer from '@/stepper/step-runner';
import stepperMixin from '@/stepper/mixin';
// import * as d3 from 'd3'
import * as R from 'ramda'
import makeMap from '@/map2/make-map';
import MapManager from '@/map2/map-manager';

import WebSocketClient from '@/realtime/ws-client';

import simulationService from '@/service/simulation-service';

import SimulationResult from '@/pages/SimulationResult.vue';

import HistogramChart from '@/components/charts/HistogramChart';
import Doughnut from '@/components/charts/Doughnut';

import statisticsService from '@/service/statistics-service';
import congestionColor from '@/utils/colors';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import UniqCongestionColorBar from '@/components/CongestionColorBar';
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt';
import UniqMapChanger from '@/components/UniqMapChanger';

import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning';
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished';

import bins from '@/stats/histogram'
import UniqCardTitle from '@/components/func/UniqCardTitle';
import region from '@/map2/region'
import config from '@/stats/config'
import makeRewardChartData from '@/charts/chartjs/utils/make-reward-chart';
import { optimizationService } from '@/service'

import toastMixin from '@/components/mixins/toast-mixin';


const pieDefault = () => ({
  datasets: [{
    data: [1, 1, 1],
    backgroundColor:["red","orange","green"],
  }],
  labels: [ '막힘', '정체', '원활' ],
})

const makeLinkSpeedChartData = (data1, data2, data3) => {
  const dataset = (label, color, data) => ({
    label,
    fill: false,
    borderColor: color,
    backgroundColor: color,
    borderWidth: 2,
    pointRadius: 1,
    data,
  })

  return {
    labels: new Array(data2.length).fill(0).map((_, i) => i),
    datasets: [
      dataset('기존신호', 'grey', data1),
      dataset('최적화신호', 'blue', data2),
      // dataset('제한속도', '#FF0000', data3),
    ],
  }
}

const dataset = (label, color, data) => ({
  label,
  fill: false,
  borderColor: color,
  backgroundColor: color,
  borderWidth: 2,
  pointRadius: 1,
  data,
})

const makeLineData = (data1, data2) => {

  return {
    labels: new Array(data1.length).fill(0).map((_, i) => i),
    datasets: [
      dataset('기존신호', 'grey', data1),
      dataset('최적화신호', 'blue', data2),
    ],
  }
}

const lineChartOption  = () => ({
  responsive: true,
  title: {
    display: false,
    text: 'Line Chart'
  },
  tooltips: {
    mode: 'index',
    intersect: false,
  },
  hover: {
    mode: 'nearest',
    intersect: true
  },
  scales: {
    xAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 50,
        maxRotation:0,
        display: true,
        // fontColor: 'white',
      },
      gridLines: {
        display: true,
        // color: 'grey',
      },
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation:0,
        display: true,
        // fontColor: 'white',
      },
      gridLines: {
        display: true,
        // color: 'grey',
      },
    }]
  },
  legend: {
    display: false,
    labels: {
      fontColor: "white",
      fontSize: 12
    }
  },
})

const barChartOption = () => ({
  title: {
    display: false,
    text: 'Chart.js Bar Chart - Stacked'
  },
  legend: {
    display: false,
  },
  tooltips: {
    mode: 'index',
    intersect: false
  },
  responsive: true,
  scales: {
    xAxes: [{
      stacked: true,
    }],
    yAxes: [{
      stacked: true
    }]
  }
})

const makePhaseChart = (data, type) => {
  const colors = ['skyblue', 'orange', 'green', 'blue', 'red']
  const sl = type === 'fixed' ? 1 : 2
  const datasets = data.slice(sl).map((d,i) => {
    return {
      label: `phase ${i}`,
      backgroundColor: colors[i],
      data: d

    }
  })

  return {
    labels: data[0],
    datasets,
    // datasets: [{
    //   label: 'Dataset 1',
    //   backgroundColor: 'skyblue',
    //   data: data[1]
    // }, {
    //   label: 'Dataset 2',
    //   backgroundColor: 'orange',
    //   data: data[2]
    // }]
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
    BarChart,
    HistogramChart,
    Doughnut,
    UniqCongestionColorBar,
    UniqSimulationResultExt,
    UniqMapChanger,
    UniqCardTitle
  },
  data() {
    return {
      simulationId: null,
      simulationId2: null,
      simulation: { configuration: {} },
      simulation2: { configuration: {} },
      map: null,
      map2: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      mapId2: `map-${Math.floor(Math.random() * 100)}`,

      mapHeight: 1024, // map view height
      mapManager: null,
      mapManager2: null,
      speedsPerStep: {},
      sidebar: false,
      currentStep: 1,
      slideMax: 0,
      showLoading: false,
      congestionColor,
      currentEdge: null,
      playBtnToggle: false,
      player: null,
      wsClient: null,
      wsClient2: null,
      chart: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
        currentSpeeds: [],
        currentSpeedChart: {}
      },
      chart2: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
        currentSpeeds: [],
        currentSpeedChart: {}
      },
      currentZoom: '',
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0.00,
      linkHover: '',
      progress: 0,
      focusData: {
        speed: 0.00
      },
      avgSpeedView: pieDefault(),
      avgSpeedFocus: pieDefault(),
      logs: [],
      bottomStyle: {
        height: '220px',
        borderRadius: '0px',
        overflowY:'auto',
        overflowX:'hidden',
        position: 'fixed',
        bottom: 0,
        width: '100%',
      },
      playerStyle: {
        zIndex: 999,
        position: 'fixed',
        width: '300px',
        bottom: '10px',
        left: '10px',
      },
      chartContainerStyle: {
        borderRadius: 0,
        height: this.mapHeight + 'px',
        overflow: 'auto'
      },
      lineChartOption,
      barChartOption,
      rewards: {},
      phaseFixed: {},
      phaseTest: {},
      selectedModel: 1,
      testSlave: null,
      fixedSlave: null,
      selectedEpoch: 0,
    };
  },
  destroyed() {
    if (this.map) {
      this.map.remove();
      this.map2.remove();
    }
    if(this.stepPlayer) {
      this.stepPlayer.stop();
    }
    if(this.wsClient) {
      this.wsClient.close()
      this.wsClient2.close()
    }
    window.removeEventListener("resize", this.getWindowHeight);
  },
  async mounted() {
    log(`mounted ${this.$options.name}`)
    this.simulationId = this.$route.params ? this.$route.params.id : null;

    this.showLoading = true
    this.resize()

    this.map = makeMap({ mapId: this.mapId });
    this.map2 = makeMap({ mapId: this.mapId2 });

    const { simulation, ticks } = await simulationService.getSimulationInfo(this.simulationId);
    this.simulation = simulation;
    this.testSlave = simulation.slaves[0]
    this.fixedSlave = simulation.slaves[1]

    this.slideMax = ticks - 1

    const bus = new Vue({})
    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.fixedSlave,
      eventBus: this
    });
    this.mapManager2 = MapManager({
      map: this.map2,
      simulationId: this.testSlave,
      eventBus: bus
    });

    this.mapManager.loadMapData();
    this.mapManager2.loadMapData();

    this.wsClient = WebSocketClient({
      simulationId: this.fixedSlave,
      eventBus: this
    })
    this.wsClient.init()

    this.wsClient2 = WebSocketClient({
      simulationId: this.testSlave,
      eventBus: bus
    })

    this.wsClient2.init()

    this.showLoading = false

    this.$on('link:selected', (link) => {
      this.currentEdge = link;
      if(link.speeds) {
        if(!this.speedsPerStep.datasets) {
          return;
        }
        this.chart.linkSpeeds = makeLinkSpeedChartData(
          link.speeds,
          this.speedsPerStep.datasets[0].data,
          new Array(link.speeds.length).fill(this.edgeSpeed())
        )
      }

      return;
    })

    this.$on('link:hover', (link) => {
      this.linkHover = link.LINK_ID
      return;
    })


    const updateChart = () => {
      setTimeout(() => {
        this.chart.currentSpeedChart = makeLineData(
          this.chart.currentSpeeds,
          this.chart2.currentSpeeds,
        )
        updateChart()
      }, 1000)
    }

    const calcAvgSpeed = roads => roads.map(road => road.speed).reduce((acc, cur) => {
      acc += cur
      return acc
    }, 0) / roads.length

    this.$on('salt:data', (d) => {

      // const avgSpeed = d.roads.map(road => road.speed).reduce((acc, cur) => {
      //   acc += cur
      //   return acc
      // }, 0) / d.roads.length

      const avgSpeed = calcAvgSpeed(d.roads)
      console.log('--->', avgSpeed)
      this.chart.currentSpeeds.push((avgSpeed).toFixed(2) * 1)
      // this.chart2.currentSpeeds.push(avgSpeed + Math.random() * 10)
      // this.chart.currentSpeedChart = makeLineData(this.chart.currentSpeeds)

      this.avgSpeedView = {
        datasets: [{
          data: bins(d.roads).map(R.prop('length')),
          backgroundColor:config.colorsOfSpeed2,
        }],
        labels: config.speeds
      }
    })

    bus.$on('salt:data', d => {
      const avgSpeed = d.roads.map(road => road.speed).reduce((acc, cur) => {
        acc += cur
        return acc
      }, 0) / d.roads.length

      this.chart2.currentSpeeds.push((avgSpeed).toFixed(2) * 1)
    })


    updateChart()

    this.$on('salt:status', async (status) => {
      this.addLog(`status: ${status.status}, progress: ${status.progress}`)
      this.progress = status.progress
      if(status.status ===1 && status.progress === 100) {
        // FINISHED
      }
    })

    this.$on('map:focus', (data) => {
      this.focusData = data
      this.avgSpeedFocus = {
        datasets: [{
          data: bins(data.realTimeEdges).map(R.prop('length')),
          backgroundColor:config.colorsOfSpeed2,
        }],
        labels: config.speeds
      }
      // console.log(bins(data.realTimeEdges))
      // console.log(data.realTimeEdges)
    })

    this.$on('salt:finished', async () => {
      log('**** SIMULATION FINISHED *****')
    })

    this.$on('map:moved', ({zoom, extent}) => {
      this.currentZoom = zoom
      this.currentExtent = [extent.min, extent.max]
    });

    this.$on('ws:open', () => {
      this.wsStatus = 'open'
    });

    this.$on('ws:error', (error) => {
      this.wsStatus = 'error'
      this.makeToast(error.message, 'warning')
    });

    this.$on('ws:close', () => {
      this.wsStatus = 'close'
      this.makeToast('ws connection closed', 'warning')
    });

    window.addEventListener('resize', this.resize);
    try {
      const c = (await optimizationService.getReward(this.fixedSlave)).data
      this.rewards = makeRewardChartData(c)
    } catch (err) {
      log(err.message)
      this.makeToast(err.message, 'warning')
    }
  },
  methods: {
    ...stepperMixin,
    addLog(text) {
      this.logs.push(`${new Date().toLocaleTimeString()} ${text}`)
      if(this.logs.length > 5) {
        this.logs.shift()
      }
    },
    toggleFocusTool() {
      this.mapManager.toggleFocusTool()
    },
    toggleState() {
      return this.playBtnToggle ? 'M' : 'A'
    },
    async updateChart() {
      this.stepPlayer = StepPlayer(this.slideMax, this.stepForward.bind(this));
      this.chart.histogramDataStep = await statisticsService.getHistogramChart(this.fixedSlave, 0);
      this.chart2.histogramDataStep = await statisticsService.getHistogramChart(this.testSlave, 0);
      this.chart.histogramData = await statisticsService.getHistogramChart(this.fixedSlave);
      this.chart2.histogramData = await statisticsService.getHistogramChart(this.testSlave);
      // this.chart.pieDataStep = await statisticsService.getPieChart(this.fixedSlave, 0);
      this.chart.pieData = await statisticsService.getPieChart(this.fixedSlave);
      this.speedsPerStep = await statisticsService.getSummaryChart(this.testSlave);
      this.speedsPerStep2 = await statisticsService.getSummaryChart(this.fixedSlave);
      this.chart.linkSpeeds = makeLinkSpeedChartData(
        this.speedsPerStep.datasets[0].data, //text
        this.speedsPerStep2.datasets[0].data, // fixed
      )
    },
    edgeSpeed() {
      if(this.currentEdge && this.currentEdge.speeds) {
        return this.currentEdge.speeds[this.currentStep] || 0
      }
      return 0
    },
    resize() {
      // this.mapHeight = window.innerHeight - 220; // update map height to current height
      this.mapHeight = window.innerHeight - 180 - 60; // update map height to current height
    },
    togglePlay() {
      this.playBtnToggle = !this.playBtnToggle;

      (this.playBtnToggle ? this.stepPlayer.start : this.stepPlayer.stop).bind(this)()
    },
    async stepChanged(step) {
      if(this.simulation.status === 'finished') {
        this.mapManager.changeStep(step);
        this.mapManager2.changeStep(step);
        this.chart.pieDataStep = await statisticsService.getPieChart(this.fixedSlave, step);
        this.chart.histogramDataStep = await statisticsService.getHistogramChart(this.fixedSlave, step);
        this.chart2.pieDataStep = await statisticsService.getPieChart(this.fixedSlave, step);
        this.chart2.histogramDataStep = await statisticsService.getHistogramChart(this.fixedSlave, step);
      }
    },
    centerTo(locationCode) {
      const center = region[locationCode] || region[1]
      this.map.animateTo({ center, }, { duration: 2000 })
    },
    async connectWebSocket() {
      this.wsClient.init()
    },
    async runTest() {

      this.chart.currentSpeeds = []
      this.chart2.currentSpeeds = []

      optimizationService.runFixed(this.fixedSlave).then(v => {})
      optimizationService.runTest(this.testSlave, 9).then(v => {})
    },
    async updatePhaseChart() {
      const phaseFixed = (await optimizationService.getPhase(this.fixedSlave, 'fixed')).data
      const phaseTest = (await optimizationService.getPhase(this.testSlave)).data
      this.phaseFixed = makePhaseChart(phaseFixed, 'fixed')
      this.phaseTest = makePhaseChart(phaseTest)
      this.updateChart()
    }
  },
};
