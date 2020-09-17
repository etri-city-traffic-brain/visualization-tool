/* eslint-disable no-unused-expressions */
/**
 * Simulation result viewer
 * This vue is divided into two cases.
 * 1: when the simulation is running
 * 2: when the simulation is finihsed
 */
import StepPlayer from '@/stepper/step-runner';

import makeMap from '@/map2/make-map';
import MapManager from '@/map2/map-manager';
import WebSocketClient from '@/map2/ws-client';
import simulationService from '@/service/simulation-service';
import stepperMixin from '@/stepper/mixin';
import HistogramChart from '@/components/charts/HistogramChart';
import Doughnut from '@/components/charts/Doughnut';
import statisticsService from '@/service/statistics-service';
import congestionColor from '@/utils/colors';

import LineChart from '@/components/charts/LineChart';
import BarChart from '@/components/charts/BarChart';
// import D3SpeedBar from '@/components/d3/D3SpeedBar';

import SimulationResult from '@/pages/SimulationResult.vue';
const mapId = `map-${Math.floor(Math.random() * 100)}`;

const dataset = (label, color, data) => ({
  label,
  fill: false,
  borderColor: color,
  backgroundColor: color,
  borderWidth: 2,
  pointRadius: 1,
  data,
})

const makeLinkSpeedChartData = (v1, v2, v3) => {
  return {
    labels: new Array(v2.length).fill(0).map((v, i) => i),
    datasets: [
      dataset('링크속도', '#7FFFD4', v1),
      dataset('전체평균속도', '#1E90FF', v2),
      dataset('제한속도', '#FF0000', v3),
    ],
  }
}

export default {
  name: 'SimulationResultMap',
  components: {
    SimulationResult,
    LineChart,
    BarChart,
    HistogramChart,
    Doughnut
  },
  data() {
    return {
      simulationId: '', // simulation id
      simulation: { configuration: {} },
      map: null,
      mapId,
      mapHeight: 800, // map view height
      mapManager: null,
      speedsPerStep: {},
      currentStep: 1,
      slideMax: 0,
      showLoading: false,
      gridData: {},
      isGridView: false,
      zoomPrevious: 17,
      congestionColor,
      currentEdge: '',
      playBtnToggle: false,
      player: null,
      wsClient: null,
      chart: {
        histogramDataStep: null,
        histogramData: null,
        pieDataStep: null,
        pieData: null,
        linkSpeeds: [],
      }
    };
  },
  destroyed() {
    if (this.map) {
      this.map.remove();
    }
    if(this.stepPlayer) {
      this.stepPlayer.stop();
    }
    if(this.wsClient) {
      this.wsClient.close()
    }
    window.removeEventListener("resize", this.getWindowHeight);
  },
  async mounted() {
    this.simulationId = this.$route.params ? this.$route.params.id : '';
    this.showLoading = true
    this.mapHeight = window.innerHeight - 180; // update map height to current height
    this.map = makeMap({ mapId });

    const { simulation, slideMax } = await simulationService.getSimulationInfo(this.simulationId);

    this.simulation = simulation;

    this.mapManager = MapManager(this.map, this.simulationId, this);

    this.$on('link:selected', (link) => {
      this.currentEdge = link;
      if(link.speeds) {
        // this.selectedEdge = link;
        this.chart.linkSpeeds = makeLinkSpeedChartData(
          link.speeds,
          this.speedsPerStep.datasets[0].data,
          new Array(link.speeds.length).fill(this.edgeSpeed())
        )
      }
      return;

    })
    this.mapManager.loadMapData();
    if (this.simulation.status === 'finished') {
      this.slideMax = slideMax;
      this.stepPlayer = StepPlayer(this.slideMax, this.stepForward.bind(this));
      this.chart.histogramDataStep = await statisticsService.getHistogramChart(this.simulationId, 0);
      this.chart.histogramData = await statisticsService.getHistogramChart(this.simulationId);
      this.chart.pieDataStep = await statisticsService.getPieChart(this.simulationId, 0);
      this.chart.pieData = await statisticsService.getPieChart(this.simulationId);
      this.speedsPerStep = await statisticsService.getSummaryChart(this.simulationId);

      this.chart.linkSpeeds = makeLinkSpeedChartData(
        [],
        this.speedsPerStep.datasets[0].data,
        new Array(this.speedsPerStep.datasets[0].data.length).fill(this.edgeSpeed())
      )
    } else if(this.simulation.status === 'running') {
      // this.mapRealtimeManager = MapRealtimeManager(this.map, this.simulationId)
      this.wsClient = WebSocketClient(this, this.simulationId)

    }
    window.addEventListener('resize', this.resize);
    this.showLoading = false
  },
  methods: {
    ...stepperMixin,
    // padStr,
    toggleState() {
      return this.playBtnToggle ? 'Manual' : 'Auto'
    },
    edgeSpeed() {
      if(this.currentEdge && this.currentEdge.speeds) {
        return this.currentEdge.speeds[this.currentStep] || 0
      }
      return 0
    },

    resize() {
      this.height = window.innerHeight - 180; // update map height to current height
    },
    togglePlay() {
      (this.playBtnToggle ? this.stepPlayer.start : this.stepPlayer.stop).bind(this)()
    },
    async stepChanged(step) {
      if(this.simulation.status === 'finished') {
        this.mapManager.changeStep(step);
        this.pieDataStep = await statisticsService.getPieChart(this.simulationId, step);
        this.histogramDataStep = await statisticsService.getHistogramChart(this.simulationId, step);
      }
    },
    center(region) {
      if(region === 1) { // 도안
        this.map.setCenter( [127.334706, 36.346159] )
      }
    }
  },
};
