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
import WebSocketClient from '@/realtime/ws-client';
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



import UniqCongestionColorBar from '@/components/CongestionColorBar';
import UniqSimulationResultExt from '@/components/UniqSimulationResultExt';
import UniqMapChanger from '@/components/UniqMapChanger';

import region from '@/map2/region'

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
  console.log(v2)
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
    Doughnut,
    UniqCongestionColorBar,
    UniqSimulationResultExt,
    UniqMapChanger
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
      sidebar: false,
      currentStep: 1,
      slideMax: 0,
      showLoading: false,
      // gridData: {},
      // isGridView: false,
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
      },
      currentZoom: '',
      currentExtent: '',
      wsStatus: 'ready',
      avgSpeed: 0,
      linkHover: '',
      progress: 0,
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
    this.mapHeight = window.innerHeight - 480;
    this.map = makeMap({ mapId });

    const { simulation, slideMax } = await simulationService.getSimulationInfo(this.simulationId);

    this.simulation = simulation;

    this.mapManager = MapManager({
      map: this.map,
      simulationId: this.simulationId,
      eventBus:this
    });

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

    this.$on('link:hover', (link) => {
      this.linkHover = link.LINK_ID
      return;
    })


    this.$on('salt:data', (d) => {
      this.avgSpeed = d.roads.map(road => road.speed).reduce((acc, cur) => {
        acc += cur
        return acc
      }, 0) / d.roads.length
    })

    let timer;
    const checkStatus = async (simulationId) => {
      const r = await simulationService.getSimulationInfo(simulationId)
      console.log(r.simulation.status)
      if(r.simulation.status === 'finished') {
        clearTimeout(timer)
        this.$router.go(this.$router.currentRoute)
      }
      timer = setTimeout(async () => checkStatus(simulationId), 1000)
    }

    this.$on('salt:status', async (status) => {
      this.progress = status.progress

      if(status.status ===1 && status.progress === 100) {
        // finished
        // 시뮬레이션이 종료 되었으니
        // 결과파일을 다운로드 하고
        // 통계정보를 생성한다.
        // this.$router.go(this.$router.currentRoute)
        // this.simulation.status = 'finished'
        await checkStatus(status.simulationId)


      }
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

    this.mapManager.loadMapData();
    if (this.simulation.status === 'finished') {
      this.slideMax = slideMax;
      this.stepPlayer = StepPlayer(this.slideMax, this.stepForward.bind(this));
      this.chart.histogramDataStep = await statisticsService.getHistogramChart(this.simulationId, 0);
      this.chart.histogramData = await statisticsService.getHistogramChart(this.simulationId);
      this.chart.pieDataStep = await statisticsService.getPieChart(this.simulationId, 0);
      this.chart.pieData = await statisticsService.getPieChart(this.simulationId);
      this.speedsPerStep = await statisticsService.getSummaryChart(this.simulationId);
      // console.log(this.speedsPerStep)
      this.chart.linkSpeeds = makeLinkSpeedChartData(
        [],
        this.speedsPerStep.datasets[0].data,
        new Array(this.speedsPerStep.datasets[0].data.length).fill(this.edgeSpeed())
      )
    } else if(this.simulation.status === 'running') {
      this.wsClient = WebSocketClient({
        simulationId: this.simulationId,
        eventBus: this
      })
      this.wsClient.init()
    }
    window.addEventListener('resize', this.resize);
    this.showLoading = false
  },
  methods: {
    ...stepperMixin,
    toggleState() {
      return this.playBtnToggle ? 'M' : 'A'
    },

    updateChart() {

    },
    edgeSpeed() {
      if(this.currentEdge && this.currentEdge.speeds) {
        return this.currentEdge.speeds[this.currentStep] || 0
      }
      return 0
    },
    resize() {
      this.mapHeight = window.innerHeight - 480; // update map height to current height
    },
    togglePlay() {
      (this.playBtnToggle ? this.stepPlayer.start : this.stepPlayer.stop).bind(this)()
    },
    async stepChanged(step) {
      if(this.simulation.status === 'finished') {
        this.mapManager.changeStep(step);
        this.chart.pieDataStep = await statisticsService.getPieChart(this.simulationId, step);
        this.chart.histogramDataStep = await statisticsService.getHistogramChart(this.simulationId, step);
      }
    },
    center(code) {
      const center = region[code] || region[1]
      this.map.animateTo({
        center,
      },
      {
        duration: 2000
      })
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
  },
};
