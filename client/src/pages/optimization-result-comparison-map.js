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

import UniqCardTitle from '@/components/func/UniqCardTitle';
import region from '@/map2/region'
import makeRewardChartData from '@/charts/chartjs/utils/make-reward-chart';
import { optimizationService } from '@/service'

import toastMixin from '@/components/mixins/toast-mixin';

import style from '@/components/style';

const makeLinkSpeedChartData = (data1, data2) => {
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

const randomId = () => `map-${Math.floor(Math.random() * 100)}`

const calcAvgSpeed = roads => roads
  .map(road => road.speed)
  .reduce((acc, cur) => (acc += cur), 0 ) / roads.length

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
      // simulationId: null,
      simulation: { configuration: {} },
      map1: null,
      map2: null,
      mapId1: randomId(),
      mapId2: randomId(),

      mapHeight: 1024, // map view height
      mapManager1: null,
      mapManager2: null,
      sidebar: false,
      currentStep: 1,
      slideMax: 0,
      congestionColor,
      currentEdge: null,
      playBtnToggle: false,
      player: null,
      wsClient1: null,
      wsClient2: null,
      chart1: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
        currentSpeeds: [],
        speedsPerStep: {},
      },
      chart2: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
        currentSpeeds: [],
        speedsPerStep: {},
      },
      chart: {
        currentSpeedChart: {},
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
      rewards: {},
      phaseFixed: {},
      phaseTest: {},
      testSlave: null,
      fixedSlave: null,
      selectedEpoch: 0,
    };
  },
  destroyed() {
    if (this.map1) {
      this.map1.remove();
    }
    if (this.map2) {
      this.map2.remove();
    }
    if(this.stepPlayer) {
      this.stepPlayer.stop();
    }
    if(this.wsClient) {
      this.wsClient1.close()
    }
    if(this.wsClient2) {
      this.wsClient2.close()
    }
    window.removeEventListener("resize", this.getWindowHeight);
  },
  async mounted() {
    log(`${this.$options.name} is mounted`)
    const optimizationId = this.$route.params ? this.$route.params.id : null;

    const { simulation, ticks } = await simulationService.getSimulationInfo(optimizationId);

    this.simulation = simulation;
    this.testSlave = simulation.slaves[0]
    this.fixedSlave = simulation.slaves[1]
    this.slideMax = ticks - 1

    this.resize()

    this.map1 = makeMap({ mapId: this.mapId1 });
    this.map2 = makeMap({ mapId: this.mapId2 });

    const bus1 = new Vue({})
    const bus2 = new Vue({})

    this.mapManager1 = MapManager({ map: this.map1, simulationId: this.fixedSlave, eventBus: bus1 });
    this.mapManager2 = MapManager({ map: this.map2, simulationId: this.testSlave, eventBus: bus2 });

    this.wsClient1 = WebSocketClient({ simulationId: this.fixedSlave, eventBus: bus1 })
    this.wsClient2 = WebSocketClient({ simulationId: this.testSlave, eventBus: bus2 })

    this.map1.on('moveend', (e) => {
      this.map2.setCenter(e.target.getCenter());
    });

    this.map1.on('zoomend', (e) => {
      this.map2.setCenterAndZoom(e.target.getCenter(), e.target.getZoom());
    });



    this.updateChartRealtime()

    bus1.$on('salt:data', (d) => {
      const avgSpeed = calcAvgSpeed(d.roads)
      this.chart1.currentSpeeds.push((avgSpeed).toFixed(2) * 1)
    })

    bus2.$on('salt:data', d => {
      const avgSpeed = calcAvgSpeed(d.roads)
      this.chart2.currentSpeeds.push((avgSpeed).toFixed(2) * 1)
    })

    bus1.$on('salt:status', async (status) => {
      this.progress1 = status.progress
    })

    bus2.$on('salt:status', async (status) => {
      this.progress2 = status.progress
    })

    bus1.$on('salt:finished', async () => {
      log('**** SIMULATION FINISHED *****')
      if (this.progress1 >= 100 && this.progress2 >= 100) {
        this.updateChart()
      }
    })
    bus2.$on('salt:finished', async () => {
      log('**** SIMULATION FINISHED *****')
      if (this.progress1 >= 100 && this.progress2 >= 100) {
        this.updateChart()
      }
    })

    bus1.$on('ws:error', (error) => {
      this.makeToast(error.message, 'warning')
    });

    bus1.$on('ws:close', () => {
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
    toggleFocusTool() {
      this.mapManager.toggleFocusTool()
    },
    toggleState() {
      return this.playBtnToggle ? 'M' : 'A'
    },

    updateChartRealtime() {
      if( this.progress2 >= 100 && this.progress1 >= 100) {
        log('all simulations are finished')
        return
      }
      setTimeout(() => {
        this.chart.currentSpeedChart = makeLineData(
          this.chart1.currentSpeeds,
          this.chart2.currentSpeeds,
        )
        this.updateChartRealtime()
      }, 1000)
    },
    async updateChart() {
      this.stepPlayer = StepPlayer(this.slideMax, this.stepForward.bind(this));
      this.chart1.histogramDataStep = await statisticsService.getHistogramChart(this.fixedSlave, 0);
      this.chart2.histogramDataStep = await statisticsService.getHistogramChart(this.testSlave, 0);
      this.chart1.histogramData = await statisticsService.getHistogramChart(this.fixedSlave);
      this.chart2.histogramData = await statisticsService.getHistogramChart(this.testSlave);
      this.chart1.pieData = await statisticsService.getPieChart(this.fixedSlave);
      this.chart1.speedsPerStep = await statisticsService.getSummaryChart(this.testSlave);
      this.chart2.speedsPerStep = await statisticsService.getSummaryChart(this.fixedSlave);
      this.chart1.linkSpeeds = makeLinkSpeedChartData(
        this.chart1.speedsPerStep.datasets[0].data, //text
        this.chart2.speedsPerStep.datasets[0].data, // fixed
      )
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
        this.mapManager1.changeStep(step);
        this.mapManager2.changeStep(step);
        this.chart1.pieDataStep = await statisticsService.getPieChart(this.fixedSlave, step);
        this.chart1.histogramDataStep = await statisticsService.getHistogramChart(this.fixedSlave, step);
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
      this.chart1.currentSpeeds = []
      this.chart2.currentSpeeds = []

      optimizationService.runFixed(this.fixedSlave).then(v => {})
      optimizationService.runTest(this.testSlave, 9).then(v => {})
      this.progress1 = 0
      this.progress2 = 0
      this.updateChartRealtime()
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
