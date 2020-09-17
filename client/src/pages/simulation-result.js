
/**
 * visualize simulation result
 *
 * SimulationResult.vue implementations
 *
 * author: yeonheon Gu
 * last modified: 2019-05-21
 */
import BarChart from '@/components/charts/BarChart';
import HistogramChart from '@/components/charts/HistogramChart';
import Doughnut from '@/components/charts/Doughnut';
import StepPlayer from '@/stepper/step-runner';
import { statisticsService, simulationService } from '@/service';
import StepperMixin from '@/stepper/mixin';
import regionCode from '@/region-code';

export default {
  name: 'SimulationResult',
  components: {
    BarChart,
    Doughnut,
    HistogramChart,
  },
  props: ['simulationId'],
  data() {
    return {
      speedsPerStep: null,
      currentStep: 0,
      slideMax: 0,
      simulation: { configuration: {} },
      stepPlayer: null,
      ready: false,
      pieData: null,
      pieDataStep: null,
      histogramData: null,
      histogramDataStep: null,
    };
  },
  destroyed() {
    this.stepPlayer && this.stepPlayer.stop();
  },
  async mounted() {
    const { simulationId, slideMax } = this;
    await this.loadSimulationInfo(simulationId);
    this.stepPlayer = StepPlayer(slideMax, this.stepForward.bind(this));
    this.speedsPerStep = await statisticsService.getSummaryChart(simulationId);
    this.speedsPerStep.labels = new Array(this.speedsPerStep.labels.length).fill(0).map((v, i) => i)
    this.pieData = await statisticsService.getPieChart(simulationId);
    this.pieDataStep = await statisticsService.getPieChart(simulationId, 0);
    this.histogramData = await statisticsService.getHistogramChart(simulationId);
    this.histogramDataStep = await statisticsService.getHistogramChart(simulationId, 0);
    this.ready = true
  },
  methods: {
    ...StepperMixin,
    getRegionName(code) {
      return regionCode[code] || regionCode[0]
    },
    async stepChanged(step) {
      this.pieDataStep = await statisticsService.getPieChart(this.simulationId, step);
      this.histogramDataStep = await statisticsService.getHistogramChart(this.simulationId, step);
    },
    async loadSimulationInfo(simulationId) {
      const { simulation, slideMax } = await simulationService.getSimulationInfo(simulationId);
      this.simulation = simulation;
      this.slideMax = slideMax;
    },
  },
};
