/* eslint-disable no-unused-expressions */

import * as R from 'ramda'

import makeMap from '@/map2/make-map';
import MapManager from '@/map2/map-manager';
import WebSocketClient from '@/realtime/ws-client';
import SimulationResult from '@/pages/SimulationResult.vue';
import bins from '@/stats/histogram'
import config from '@/stats/config'
import { optimizationService } from '@/service'

import HistogramChart from '@/components/charts/HistogramChart';
import Doughnut from '@/components/charts/Doughnut';
import congestionColor from '@/utils/colors';
import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
import UniqCongestionColorBar from '@/components/CongestionColorBar';
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt';
import UniqMapChanger from '@/components/UniqMapChanger';
import UniqCardTitle from '@/components/func/UniqCardTitle';
import SimulationDetailsOnRunning from '@/components/SimulationDetailsOnRunning';
import SimulationDetailsOnFinished from '@/components/SimulationDetailsOnFinished';

const pieDefault = () => ({
  datasets: [{
    data: [1, 1, 1],
    backgroundColor:["red","orange","green"],
  }],
  labels: [ '막힘', '정체', '원활' ],
})

const { log } = console

const defaultOption  = () => ({
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
        fontColor: 'white',
      },
    }],
    yAxes: [{
      ticks: {
        autoSkip: true,
        autoSkipPadding: 10,
        maxRotation:0,
        display: true,
        fontColor: 'white',
      },
    }]
  },
  legend: {
    display: true,
    labels: {
      fontColor: "white",
      fontSize: 12
    }
  },
})

function makeRewardChartData(data) {
  if (!data) {
    return {}
  }
  return {
    labels: data[0],
    datasets: [{
      label: 'Reward',
      backgroundColor: 'skyblue',
      borderColor: 'skyblue',
      data: data[1],
      fill: false,
    }]
  }
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
  data() {
    return {
      simulationId: null,
      simulation: { configuration: {} },
      map: null,
      mapId: `map-${Math.floor(Math.random() * 100)}`,
      mapHeight: 1024, // map view height
      mapManager: null,
      // speedsPerStep: {},
      sidebar: false,
      currentStep: 1,
      slideMax: 0,
      showLoading: false,
      congestionColor,
      currentEdge: null,
      // playBtnToggle: false,
      // player: null,
      wsClient: null,
      // chart: {
      //   histogramDataStep: null,
      //   histogramData: null,
      //   pieDataStep: null,
      //   pieData: null,
      //   linkSpeeds: [],
      // },
      currentZoom: '',
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0.00,
      // linkHover: '',
      progress: 0,
      // focusData: {
      //   speed: 0.00
      // },
      avgSpeedView: pieDefault(),
      avgSpeedFocus: pieDefault(),
      logs: [],
      defaultOption,
      rewards: { labels: []}
    };
  },
  destroyed() {
    if (this.map) {
      this.map.remove();
    }
    if(this.wsClient) {
      this.wsClient.close()
    }
    window.removeEventListener("resize", this.getWindowHeight);
  },
  async mounted() {

    this.simulationId = this.$route.params ? this.$route.params.id : null;
    this.showLoading = true
    this.resize()
    this.map = makeMap({ mapId: this.mapId });
    // await this.updateSimulation()

    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus: this
    });

    this.mapManager.loadMapData();
    this.wsClient = WebSocketClient({
      simulationId: this.simulationId,
      eventBus: this
    })
    this.wsClient.init()

    this.showLoading = false

    this.$on('salt:data', (d) => {
      this.avgSpeed = d.roads.map(road => road.speed).reduce((acc, cur) => {
        acc += cur
        return acc
      }, 0) / d.roads.length


      this.avgSpeedView = {
        datasets: [{
          data: bins(d.roads).map(R.prop('length')),
          backgroundColor:config.colorsOfSpeed2,
        }],
        labels: config.speeds
      }
    })

    this.$on('salt:status', async (status) => {
      this.addLog(`status: ${status.status}, progress: ${status.progress}`)
      this.progress = status.progress
      if(status.status ===1 && status.progress === 100) {
        // FINISHED
      }
    })

    this.$on('salt:finished', async () => {
      log('**** SIMULATION FINISHED *****')
      await this.updateSimulation()
      await this.updateChart()
    })

    this.$on('optimization:epoch', (e) => {
      log('*** OPTIMIZATION EPOCH ***')
      console.log(e.data)
      this.rewards = makeRewardChartData(e.data)
    })

    this.$on('optimization:finished', (e) => {
      log('*** OPTIMIZATION FINISHED ***')
      // this.rewards = makeRewardChartData(e.data)
      setTimeout(() => this.$swal('신호 최적화 완료'), 2000)
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
  },
  methods: {
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
    // async updateSimulation() {
    //   const { simulation, ticks } = await simulationService.getSimulationInfo(this.simulationId);
    //   this.simulation = simulation;
    //   this.slideMax = ticks - 1
    // },
    edgeSpeed() {
      if(this.currentEdge && this.currentEdge.speeds) {
        return this.currentEdge.speeds[this.currentStep] || 0
      }
      return 0
    },
    resize() {
      this.mapHeight = window.innerHeight - 60; // update map height to current height
    },

    makeToast(msg, variant='info') {
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
    async runTrain() {
      try {
        await optimizationService.runTrain(this.simulationId)
      } catch (err) {
        log(err.message)
      }
    }
  },
};
